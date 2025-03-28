import jwt from 'jsonwebtoken'

export const generateToken = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '7d'
    })

    res.cookie('jwt', token, {
        // maximum age of the token in milliseconds
        maxAge: 7*24*60*60*100,
        httpOnly: true,
        sameSize: 'strict',
        secure: process.env.NODE_ENV !=='development',
    });

    return token;
};