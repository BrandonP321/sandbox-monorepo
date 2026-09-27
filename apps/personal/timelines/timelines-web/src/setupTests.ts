import "@repo/config-test/setup-dom";

// jsdom does not implement native dialog focus/inert behavior; inspect in-browser.
HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
HTMLDialogElement.prototype.close = function () {
  this.open = false;
};
