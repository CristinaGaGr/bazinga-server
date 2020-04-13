const Jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	const token = req.cookies.bazinga;
	if (token) {
		Jwt.verify(token, process.env.PRIVATEKEY, (err, decoded) => {
			if (err) {
				next()
				return res.json({mensaje: 'Token inválida'});
			} else {
				req.userId = decoded;
				next();
			}
		});
	} else {
		//req.userId = '5e906d024ca19c4c94e0a6f4';
		 req.userId = null;
		next();
	}
};