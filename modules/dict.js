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


function createDictProxy() {
  // This is inside createDictProxy to be unique for each proxy
  function DictVal(aVal) {
    this.value = aVal;
    // This should be immutable
    Object.freeze(this);
  }

  // This is the actual dictionary of items. Each valid item is a DictVal
  // instance containing the item.
  let items = {};
  return {
    /**
     * Given a string, returns whether the string is a key in this dictionary.
     */
    _isKey: function DictProxy__isKey(aStr) {
      return (items.hasOwnProperty(aStr) && items[aStr] instanceof DictVal);
    },

    getOwnPropertyDescriptor: function DictProxy_getOwnPropertyDescriptor(aName) {
      if (!this._isKey(aName))
        return undefined;

      return {
        value: items[aName].value,
        writable: true,
        configurable: true,
        enumerable: true,
      };
    },

    getOwnPropertyNames: function DictProxy_getOwnPropertyNames(aName) {
      // getOwnPropertyNames on items should return exactly the set of
      // keys that we've added.
      return Object.getOwnPropertyNames(items);
    },

    delete: function DictProxy_delete(aName) {
      if (!this._isKey(aName))
        return (delete items[aName]);
      return false;
    },

    has: function DictProxy_has(aName) {
      // We make "in" behave like hasOwnProperty
      return this._isKey(aName);
    },

    hasOwn: function DictProxy_hasOwn(aName) {
      return this._isKey(aName);
    },

    get: function DictProxy_get(aReceiver, aName) {
      if (this._isKey(aName))
        return items[aName].value;
      return items[aName];
    },

    set: function DictProxy_set(aReceiver, aName, aVal) {
      items[aName] = new DictVal(aVal);
    },

    enumerate: function DictProxy_enumerate() {
      // We make for..in behave like Object.keys
      return Object.keys(items);
    },

    keys: function DictProxy_keys() {
      return Object.keys(items);
    },
  };
}

function Dict() {
  this.__proto__ = createDictProxy();
}
