function errorHandler(err,req,res,next){
    let status = 500;
    let message = "Internal Server Error"
    console.log(err,'<<<<<ERROR')
    switch(err.name){
        case "cannotEmpty":
            status = 400
            message = "Please fill in all the blank"
            break;
        case "EmailPasswordInvalid":
            status = 400
            message = "Invalid email or password"
            break;
        case "TokenExpiredError":
            status = 401
            message = "Authentication Error"
        case "JsonWebTokenError":
            status = 401
            message = "Authentication Error"
            break;
        case "AuthenticationError":
            status = 401
            message = "Authentication Error"
            break;
        case "SequelizeValidationError":
            status = 400
            message = err.errors[0].message
            break;
        case "SequelizeForeignKeyConstraintError":
            status = 400,
            message = "Something went wrong, please use the valid format"
            break;
        case "SequelizeUniqueConstraintError":
            status = 400
            message = err.errors[0].message
            break;
        case "NotFound":
            status = 404
            message = "Data not found"
            break;
        case "ItemZero":
            status = 400
            message = "Item not available"
            break;
        case "NotEnough":
            status = 400
            message = "Stock not enough"
            break;
        case "AlreadyReturned":
            status = 400
            message = "You already returned this item"
            break;
        case "Forbidden":
            status = 403
            message = "Access Forbidden"
            break;
    }

    res.status(status).json({message})
};

module.exports = errorHandler