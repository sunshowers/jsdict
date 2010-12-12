/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 * 
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 * 
 * The Original Code is dict.js.
 * 
 * The Initial Developer of the Original Code is
 * the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 * 
 * Contributor(s):
 *   Siddharth Agarwal <sid.bugzilla@gmail.com>
 * 
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK ***** */

"use strict";

var EXPORTED_SYMBOLS = ["Dict"];

Components.utils.import("resource://jsdict/dictbase.js");

function createDictProxy(aInitial) {
  let dict = new DictBase(aInitial);

  return Proxy.create({
    getOwnPropertyDescriptor: function DictProxy_getOwnPropertyDescriptor(aName) {
      let pd = Object.getOwnPropertyDescriptor(dict, aName);
      if (pd)
        pd.configurable = true;
      return pd;
    },

    getOwnPropertyNames: function DictProxy_getOwnPropertyNames(aName) {
      return Object.getOwnPropertyNames(dict);
    },

    delete: function DictProxy_delete(aName) {
      // dict is frozen, so this is always going to fail.
      return (delete dict[aName]);
    },

    has: function DictProxy_has(aName) {
      // This is special -- we make this test for whether this key is in the
      // dictionary
      return dict.has(aName);
    },

    hasOwn: function DictProxy_hasOwn(aName) {
      return dict.hasOwnProperty(aName);
    },

    get: function DictProxy_get(aReceiver, aName) {
      // Don't allow the outside world to access |_items|
      if (aName === "_items")
        return undefined;
      // We're assuming that only functions exist. Testing using typeof seems to
      // be slow.
      if (aName in dict)
        return dict[aName].bind(dict);
      return undefined;
    },

    set: function DictProxy_set(aReceiver, aName, aVal) {
      // We could just try to set the value on dict, but we'll be nicer and
      // throw an exception
      throw new Error("Setting properties on this dictionary is not allowed. " +
                      "To set keys, use |dict.set|");
    },

    enumerate: function DictProxy_enumerate() {
      // We make for..in iterate over the keys.
      return dict.keys();
    },

    iterate: function DictProxy_iterate() {
      return dict.iterkeys();
    },

    keys: function DictProxy_keys() {
      return Object.keys(dict);
    },
  });
}

function Dict(aInitial) {
  if (aInitial === undefined)
    aInitial = {};
  // Instead of the newly created object, this returns our proxy. We can't use
  // __proto__ here because while setting a value there's going to be no reason
  // to actually look up the prototype chain.
  return createDictProxy(aInitial);
}
