const checkAuth = function(req, res, next){
    if (!req.session.user_id) {
      console.log('Not allowed');
      res.redirect('/');
    } else {
      console.log('Allowed');
      next();
    }
}

module.exports = {
    checkAuth : checkAuth,
};
