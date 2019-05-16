import {THREE} from '../libs'

export default class TextureAnimator {
  constructor(img, tilesHoriz, tilesVert, numTiles, tileDispDuration) {

    const texture = new THREE.Texture();
    texture.minFilter = THREE.LinearFilter;
    texture.image = img;
    texture.needsUpdate = true;

  	// note: texture passed by reference, will be updated by the update function.
    this.texture = texture;
  	this.tilesHorizontal = tilesHoriz;
  	this.tilesVertical = tilesVert;
  	// how many images does this spritesheet contain?
  	//  usually equals tilesHoriz * tilesVert, but not necessarily,
  	//  if there at blank tiles at the bottom of the spritesheet.
  	this.numberOfTiles = numTiles;
  	texture.repeat.set(1/this.tilesHorizontal, 1/this.tilesVertical);

  	// how long should each image be displayed?
  	this.tileDisplayDuration = tileDispDuration;

  	// how long has the current image been displayed?
  	this.currentDisplayTime = 0;

  	// which image is currently being displayed?
  	this.currentTile = 0;
  }

  update(milliSec) {
    this.currentDisplayTime += milliSec;
    while(this.currentDisplayTime > this.tileDisplayDuration) {
      this.currentDisplayTime -= this.tileDisplayDuration;
      ++this.currentTile;
      if(this.currentTile == this.numberOfTiles)
        this.currentTile = 0;
      var currentColumn = this.currentTile%this.tilesHorizontal;
      this.texture.offset.x = currentColumn/this.tilesHorizontal;
      var currentRow = Math.floor(this.currentTile/this.tilesHorizontal);
      this.texture.offset.y = currentRow/this.tilesVertical;
    }
  }

  dispose() {
    const img = this.texture.image;
    img.height = img.width = 0;
    this.texture.dispose();
  }
}
