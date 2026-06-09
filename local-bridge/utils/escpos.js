// ESC/POS command builder — stubs only.
// Real commands will be added when a USB or LAN printer is integrated.

const ESC = "\x1b";

const commands = {
  // Initialise printer
  init: () => Buffer.from(`${ESC}@`),

  // Cut paper (full cut)
  cut: () => Buffer.from(`${ESC}m`),

  // Open cash drawer (pulse on pin 2)
  openDrawer: () => Buffer.from(`${ESC}p\x00\x19\xFA`),

  // Bold on / off
  boldOn:  () => Buffer.from(`${ESC}E\x01`),
  boldOff: () => Buffer.from(`${ESC}E\x00`),

  // Center / left align
  alignCenter: () => Buffer.from(`${ESC}a\x01`),
  alignLeft:   () => Buffer.from(`${ESC}a\x00`),

  // Line feed
  feed: (lines = 1) => Buffer.from("\n".repeat(lines)),
};

module.exports = { commands };
