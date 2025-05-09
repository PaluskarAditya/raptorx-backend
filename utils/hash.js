const bcrypt = require('bcryptjs');

const hashPWD = async (payload) => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(payload, salt);
    return hashed;
};

module.exports = hashPWD;