const Pusher = require("pusher");

const pusher = new Pusher({
    appId: "1596307",
    key: "4ad2f673d2e939651348",
    secret: "f886a41c01d003dd649f",
    cluster: "eu",
    useTLS: true
  });
module.exports = pusher