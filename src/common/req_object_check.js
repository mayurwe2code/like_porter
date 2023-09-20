// const obj = {a: "jj", b: "jj", c: 'hh'};

export async function check_blank_key_in_obj(obj) {
    const isNullUndefEmptyStr = Object.values(obj).every(value => {
        // 👇️ check for multiple conditions
        if (value !== null && value !== undefined && value !== "null" && value !== "undefined") {
            return true;
        }
        return false;
    });
    return isNullUndefEmptyStr
}
