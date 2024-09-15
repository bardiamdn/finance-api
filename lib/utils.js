const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const Space = require("../db/space");
const Profile = require("../db/profile");

const pathToKey = path.join(__dirname, "../keypairs", "id_rsa_priv.pem");
const pathToPubKey = path.join(__dirname, "../keypairs", "id_rsa_pub.pem");
const PRIV_KEY = fs.readFileSync(pathToKey, "utf8");
const PUB_KEY = fs.readFileSync(pathToPubKey, "utf8");

function validPassword(password, hash, salt) {
  var hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return hash === hashVerify;
}

function genPassword(password) {
  var salt = crypto.randomBytes(32).toString("hex");
  var genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return {
    salt: salt,
    hash: genHash,
  };
}

function issueJWT(user) {
  const _id = user._id;

  const expiresIn = "7d";

  const payload = {
    sub: _id,
    iat: Math.floor(Date.now() / 1000),
  };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, {
    expiresIn: expiresIn,
    algorithm: "RS256",
  });

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn,
  };
}

async function authMiddleware(req, res, next) {
  if (!req.headers.authorization) {
    res
      .status(401)
      .json({ success: false, msg: "Authorization header not found" });
  }

  const tokenParts = req.headers.authorization.split(" ");

  if (
    tokenParts[0] !== "Bearer" ||
    tokenParts[1].match(/\S+\.\S+\.\S+/) === null
  ) {
    res.status(401).json({
      success: false,
      msg: "You are not authorized to visit this route",
    });
  }

  try {
    const verification = jsonwebtoken.verify(tokenParts[1], PUB_KEY, {
      algorithms: ["RS256"],
    });

    const timeToExp = verification.exp - Math.floor(Date.now() / 1000);
    if (timeToExp > 0) {
      // check the user authenticity if needed
      const userProfile = await Profile.findOne({ userId: verification.sub });

      if (!userProfile || userProfile === -1) {
        res.status(401).json({ success: false, msg: "User not found" });
      }

      req.profile = userProfile;
      req.jwt = verification;

      console.log(req);
      next();
    } else {
      res.status(401).json({ success: false, msg: "Token expired" });
    }
  } catch (err) {
    console.error(err);
    res.status(401).json({
      success: false,
      msg: "You are not authorized to visit this route",
    });
  }
}

async function isAdmin(req, res, next) {
  try {
    const userId = req.body.userId;
    const spaceId = req.params.spaceId;

    const admin = await Space.findOne({
      _id: spaceId,
      admins: { $in: [userId] },
    });

    if (admin) {
      next();
    } else {
      console.log("User is not an admin.");
      res
        .status(403)
        .json({ success: false, message: "User is not an admin." });
    }
  } catch (err) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
module.exports.authMiddleware = authMiddleware;
module.exports.isAdmin = isAdmin;
