class Result {
    constructor(value, is_ok) {
        if(typeof is_ok !== "boolean") throw new Error("is_ok should be a boolean");

        this._value = value;
        this._is_ok = is_ok;
    }

    unwrap() {
        if(!this._is_ok) {
            throw new Error("Unwrapped an error result");
        }

        return this._value;
    }

    unwrap_err() {
        if(this._is_ok) {
            throw new Error("Unwrap_err'd an okay result");
        }

        return this._value;
    }

    is_ok() {
        return this._is_ok;
    }

    is_err() {
        return !this._is_ok;
    }
}

function Ok(x) {
    return new Result(x, true);
}

function Err(x) {
    return new Result(x, false);
}

class Option {
    constructor(value, is_some) {
        if(typeof is_some !== "boolean") throw new Error("is_some should be a boolean");

        this._value = value;
        this._is_some = is_some;
    }

    unwrap() {
        if(!this._is_some) {
            throw new Error("Unwrapped a None option");
        }

        return this._value;
    }

    is_some() {
        return this._is_some;
    }

    is_none() {
        return !this._is_some;
    }
}

function Some(x) {
    return new Option(x, true);
}

function None() {
    return new Option(null, false);
}