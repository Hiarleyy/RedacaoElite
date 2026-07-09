
const adminMiddleware = (cargosPermitidos) => {
  return (req, res, next) => {
    const user = req.authenticatedUser;

    if (!user){
      return res.status(401).json({ message: "Usuário Não autorizado. Faça login novamente." });
    };

    if (!cargosPermitidos.includes(user.tipoUsuario)){
      return res.status(403).json({ message: "Você não tem permissão para realizar essa ação." });
    }
    
    next();
  };
};

module.exports = adminMiddleware;


  