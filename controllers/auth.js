const crypto = require("crypto");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      // api_key: Api key goes here..
    }
  })
);

// Registers a user

exports.signUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email })
    .then(userDoc => {
      if (userDoc) {
        return res.status(401).send("User already exists");
      }
      bcrypt
        .hash(password, 12)
        .then(password => {
          let user = new User({
            email,
            password,
            cart: { items: [] }
          });
          return user.save();
        })
        .then(() => res.status(200).send("User registered successfully"));
    })
    .catch(err => console.log(err));
};

//  Logs in a user

exports.logIn = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res
          .status(404)
          .send("User not found, please provide valid credentials");
      }
      bcrypt.compare(password, user.password).then(valid => {
        if (!valid) {
          return res
            .status(403)
            .send(
              "Incorrect username or password, please review details and try again"
            );
        }
        res.status(200).send({
          _id: user._id,
          email: user.email,
          cart: user.cart
        });
      });
    })
    .catch(err => console.log(err));
};

exports.passwordReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) res.status(402).send({ message: "something went wrong" });
    const token = buffer.toString("hex");
    console.log(req.body.email);
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          res.status(404).send({ message: "aww sorry, user not found!" });
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        console.log(user.resetTokenExpiration);
        return user.save();
      })
      .then(result => {
        res
          .status(200)
          .send({ message: "Password reset link sent successfully" });
        transporter.sendMail({
          to: req.body.email,
          from: "abeshekwere@gmail.com",
          subject: "Password Reset",
          html: `<p>You requested a password reset</p>
                <p>Please click this <a href="/https://localhost:3000/reset/${token}">link</a> to set a new password</p>
          `
        });
      })
      .catch(err => console.log(err));
  });

  exports.updatePassword = async (req, res, next) => {
        const token = req.params.token;
        try {
          const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
          });
        } catch (err) {
          console.log(err);
        }
      };
};
