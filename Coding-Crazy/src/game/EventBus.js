import Phaser from 'phaser';

// Used to emit events between React components and Phaser scenes
export const EventBus = new Phaser.Events.EventEmitter();
