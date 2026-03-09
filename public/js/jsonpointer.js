// The MIT License (MIT)
//
// Copyright (c) 2016-2021 Guenter Sandner
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// npm: https://www.npmjs.com/package/jsonpointerx
// git: https://github.com/gms1/HomeOfThings/tree/master/packages/js/jsonpointerx
// version: 1.2.4

function _extends() {
  _extends =
    Object.assign ||
    function assign(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source)
          if (Object.prototype.hasOwnProperty.call(source, key))
            target[key] = source[key];
      }
      return target;
    };
  return _extends.apply(this, arguments);
}

const fromJpStringSearch = /~[01]/g;
const toJpStringSearch = /[~/]/g;
class JsonPointer {
  get segments() {
    return this._segments.slice(0);
  }
  get root() {
    return this._segments.length === 0 ? true : false;
  }
  /**
   * Get a value from a referenced location within an object
   *
   * @param input - The object to be read from
   * @returns The value from the referenced location or undefined
   */ get(input) {
    return this.fnGet(input);
  }
  /**
   * fallback if compilation (using 'new Function') is disabled
   *
   * @param input - The object to be read from
   * @returns The value from the referenced location or undefined
   */ notCompiledGet(input) {
    let node = input;
    for (let idx = 0; idx < this._segments.length; ) {
      if (node == undefined) {
        return undefined;
      }
      node = node[this._segments[idx++]];
    }
    return node;
  }
  /**
   * Set a value to the referenced location within an object
   *
   * @param obj - To object to be written in
   * @param [value] - The value to be written to the referenced location
   * @returns       returns 'value' if pointer.length === 1 or 'input' otherwise
   *
   * throws if 'input' is not an object
   * throws if 'set' is called for a root JSON pointer
   * throws on invalid array index references
   * throws if one of the ancestors is a scalar (js engine): Cannot create propery 'foo' on 'baz'
   */ set(input, value) {
    if (typeof input !== "object") {
      throw new Error("Invalid input object.");
    }
    if (this._segments.length === 0) {
      throw new Error(`Set for root JSON pointer is not allowed.`);
    }
    const len = this._segments.length - 1;
    let node = input;
    let nextnode;
    let part;
    for (let idx = 0; idx < len; ) {
      part = this._segments[idx++];
      nextnode = node[part];
      if (nextnode == undefined) {
        if (this._segments[idx] === "-") {
          nextnode = [];
        } else {
          nextnode = {};
        }
        if (Array.isArray(node)) {
          if (part === "-") {
            node.push(nextnode);
          } else {
            const i = parseInt(part, 10);
            if (isNaN(i)) {
              throw Error(
                `Invalid JSON pointer array index reference (level ${idx}).`,
              );
            }
            node[i] = nextnode;
          }
        } else {
          node[part] = nextnode;
        }
      }
      node = nextnode;
    }
    part = this._segments[len];
    if (value === undefined) {
      delete node[part];
    } else {
      if (Array.isArray(node)) {
        if (part === "-") {
          node.push(value);
        } else {
          const i = parseInt(part, 10);
          if (isNaN(i)) {
            throw Error(
              `Invalid JSON pointer array index reference at end of pointer.`,
            );
          }
          node[i] = value;
        }
      } else {
        node[part] = value;
      }
    }
    return input;
  }
  concat(p) {
    return new JsonPointer(this._segments.concat(p.segments));
  }
  concatSegment(segment) {
    return new JsonPointer(this._segments.concat(segment));
  }
  concatPointer(pointer) {
    return this.concat(JsonPointer.compile(pointer));
  }
  toString() {
    if (this._segments.length === 0) {
      return "";
    }
    return "/".concat(
      this._segments
        .map((v) => v.replace(toJpStringSearch, JsonPointer.toJpStringReplace))
        .join("/"),
    );
  }
  toURIFragmentIdentifier() {
    if (this._segments.length === 0) {
      return "#";
    }
    return "#/".concat(
      this._segments
        .map((v) =>
          encodeURIComponent(v).replace(
            toJpStringSearch,
            JsonPointer.toJpStringReplace,
          ),
        )
        .join("/"),
    );
  }
  compileFunctions() {
    let body = "";
    for (let idx = 0; idx < this._segments.length; ) {
      const segment = this._segments[idx++]
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
      body += `
      if (node == undefined) return undefined;
      node = node['${segment}'];
      `;
    }
    body += `
      return node;
    `;
    this.fnGet = new Function("node", body);
  }
  /**
   * Instantiate a new 'JsonPointer' from encoded json-pointer
   *
   * @static
   * @param pointer - The encoded json-pointer
   * @param {boolean} [decodeOnly] - only decode and do not compile (using 'new Function')
   * @returns {JsonPointer}
   */ static compile(pointer, decodeOnly) {
    const segments = pointer.split("/");
    const firstSegment = segments.shift();
    if (firstSegment === "") {
      return new JsonPointer(
        segments.map((v) =>
          v.replace(fromJpStringSearch, JsonPointer.fromJpStringReplace),
        ),
        decodeOnly,
      );
    }
    if (firstSegment === "#") {
      return new JsonPointer(
        segments.map((v) =>
          decodeURIComponent(
            v.replace(fromJpStringSearch, JsonPointer.fromJpStringReplace),
          ),
        ),
        decodeOnly,
      );
    }
    throw new Error(`Invalid JSON pointer '${pointer}'.`);
  }
  /**
   * Get a value from a referenced location within an object
   *
   * @static
   * @param obj - The object to be read from
   * @param {string} pointer - The encoded json-pointer
   * @returns The value from the referenced location or undefined
   */ static get(obj, pointer) {
    return JsonPointer.compile(pointer).get(obj);
  }
  /**
   * Set a value to the referenced location within an object
   *
   * @static
   * @param obj - To object to be written in
   * @param pointer - The encoded json-pointer
   * @param [value] - The value to be written to the referenced location
   * @returns       returns 'value' if pointer.length === 1 or 'input' otherwise
   */ static set(obj, pointer, value) {
    return JsonPointer.compile(pointer, true).set(obj, value);
  }
  /**
   * set global options
   *
   * @static
   * @param {JsonPointerOpts} opts
   */ static options(opts) {
    if (opts) {
      JsonPointer.opts = _extends({}, JsonPointer.opts, opts);
    }
    return JsonPointer.opts;
  }
  static fromJpStringReplace(v) {
    switch (v) {
      case "~1":
        return "/";
      case "~0":
        return "~";
    }
    /* istanbul ignore next */ throw new Error(
      "JsonPointer.escapedReplacer: this should not happen",
    );
  }
  static toJpStringReplace(v) {
    switch (v) {
      case "/":
        return "~1";
      case "~":
        return "~0";
    }
    /* istanbul ignore next */ throw new Error(
      "JsonPointer.unescapedReplacer: this should not happen",
    );
  }
  /**
   * Creates an instance of JsonPointer.
   * @param [segments] - The path segments of the json-pointer / The decoded json-pointer
   * @param [noCompile] - disable compiling (using 'new Function')
   */ constructor(segments, noCompile) {
    var _JsonPointer_opts;
    if (segments) {
      if (Array.isArray(segments)) {
        this._segments = segments;
      } else {
        this._segments = [segments];
      }
    } else {
      this._segments = [];
    }
    if (
      (_JsonPointer_opts = JsonPointer.opts) == null
        ? void 0
        : _JsonPointer_opts.blacklist
    ) {
      var _JsonPointer_opts1;
      const blacklist =
        (_JsonPointer_opts1 = JsonPointer.opts) == null
          ? void 0
          : _JsonPointer_opts1.blacklist;
      this._segments.forEach((segment) => {
        if (blacklist.includes(segment)) {
          throw new Error(`JSON pointer segment '${segment}' is blacklisted`);
        }
      });
    }
    if (noCompile || (JsonPointer.opts && JsonPointer.opts.noCompile)) {
      this.fnGet = this.notCompiledGet;
    } else {
      this.compileFunctions();
    }
  }
}
JsonPointer.opts = {
  blacklist: ["__proto__", "prototype"],
};

export { JsonPointer };
