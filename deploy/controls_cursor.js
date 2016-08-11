function SETUP_cursor(){
	
	if (scene) {
		
		var clickCatcherHolder = new THREE.Object3D();
		scene.add(clickCatcherHolder);
		objHide(clickCatcherHolder);
		
		var clickCatcherMaterial = new THREE.MeshBasicMaterial({visible:false});//map:THREE.ImageUtils.loadTexture("debug.png")});//
		var catcherSides = 8;
		var catcherRad = toWorldUnits(40);
		var catcherHeight = toWorldUnits(40);
		var clickCatcherSideGeom = new THREE.PlaneGeometry(catcherRad*2,catcherHeight);//this is wider than necessary but that doesn't hurt anything
		
		var hitzoneScaleFactor = 1/0.6;
		
		for(var i=0; i<catcherSides; i++){
			var catcherSide = new THREE.Mesh(clickCatcherSideGeom,clickCatcherMaterial);
			var myAng = (i/catcherSides)*Math.PI*2;
			catcherSide.position.set(
				Math.cos(myAng)*catcherRad,
				0,
				Math.sin(myAng)*catcherRad
			);
			catcherSide.rotation.y = -myAng-Math.PI/2;
			catcherSide.scale.set(hitzoneScaleFactor,hitzoneScaleFactor,hitzoneScaleFactor);
			clickCatcherHolder.add(catcherSide);
		}
		
		var clickCatcherCapGeom = new THREE.PlaneGeometry(catcherRad*2,catcherRad*2);
		var clickCatcherTop = new THREE.Mesh(clickCatcherCapGeom,clickCatcherMaterial);
		clickCatcherTop.rotation.x = Math.PI/2;
		clickCatcherTop.position.y = catcherHeight/2;
		clickCatcherTop.scale.set(hitzoneScaleFactor,hitzoneScaleFactor,hitzoneScaleFactor);
		clickCatcherHolder.add(clickCatcherTop);
		
		var clickCatcherFloor = new THREE.Mesh(clickCatcherCapGeom,clickCatcherMaterial);
		clickCatcherFloor.rotation.x = -Math.PI/2;
		clickCatcherFloor.position.y = -enclosureInfo.innerHeight/2 + toWorldUnits(0.5);
		clickCatcherFloor.scale.set(hitzoneScaleFactor,hitzoneScaleFactor,hitzoneScaleFactor);
		scene.add(clickCatcherFloor);
		objHide(clickCatcherFloor);
		
	}
	
	
	
	var cursorIsDown = false;
	var cursorWasDown = false;
	var lastRay;
	var lastPos;
	var lastQuat;
	var lastUnit;
	function cursorUpFunc(e){
		cursorIsDown = false;
		lastPos = false;
	}
	function cursorDownFunc(e){
		cursorIsDown = true;
	}
	function cursorMoveFunc(e){
		lastRay = e.ray;
	}
	
	
	var forwardUnit = new THREE.Vector3(0,0,1);
	var upUnit = new THREE.Vector3(0,1,0);
	var zeroVec = new THREE.Vector3(0,0,0);
	
	
	var curMode;
	var currentlyEnabled;
	
	
	
	function getCursorWorld(){
		return lastRay.at(toWorldUnits(40));
	}
	function lookAtQuat(gap,up){
		// okay this is HORRIBLY convoluted but it'll do!!
		var lookMtx = new THREE.Matrix4().lookAt(zeroVec,gap,up);
		var lookQuat = new THREE.Quaternion().setFromRotationMatrix(lookMtx);
		return lookQuat;
	}
	
	
	return {
		
		updateEnabledness:function(isEnabled){
			currentlyEnabled = isEnabled;
			console.log("enabled!!!");
			if (currentlyEnabled) {
				objShow(clickCatcherHolder);
				objShow(clickCatcherFloor);
			} else {
				objHide(clickCatcherHolder);
				objHide(clickCatcherFloor);
			}
		},
		
		open:function(){
			cursorUpFunc();
			objShow(clickCatcherHolder);
			objShow(clickCatcherFloor);
			
			scene.addEventListener('cursorup',cursorUpFunc);
			scene.addEventListener('cursordown',cursorDownFunc);
			scene.addEventListener('cursormove',cursorMoveFunc);
			
		},
		
		close:function(){
			objHide(clickCatcherHolder);
			objHide(clickCatcherFloor);
			
			scene.removeEventListener('cursorup',cursorUpFunc);
			scene.removeEventListener('cursordown',cursorDownFunc);
			scene.removeEventListener('cursormove',cursorMoveFunc);
		},
		
		modeSwitch:function(newMode){
			
			switch(curMode){
				case 0://draw
					
				break;
				case 1://prim
				
				break;
				case 2://erase
				
				break;
			}
			
			curMode = newMode;
			
			switch(newMode){
				case 0://draw
					
				break;
				case 1://prim
				
				break;
				case 2://erase
				
				break;
			}
			
		},
		
		frameFunc:function(){
			if (currentlyEnabled) {
				clickCatcherHolder.position.copy(skeletonInfo.getJoint('Head').position);
				clickCatcherFloor.position.x = clickCatcherHolder.position.x;
				clickCatcherFloor.position.z = clickCatcherHolder.position.z;
			}
		},
		
		getDominantPointing:function(){
			
			if (!cursorIsDown) return false;
			
			
			var fingerPos = getCursorWorld();
			var fingerQuat = new THREE.Quaternion();
			
			switch(curMode){
				
				// it seriously might make way more sense to send a ray rather than a position + quaternion...
				
				case 0://draw
					if (lastPos) {
						var gapVect = new THREE.Vector3().subVectors(fingerPos,lastPos);
						var lookQuat = lookAtQuat(gapVect,lastUnit);
						lastUnit = new THREE.Vector3(0,1,0).applyQuaternion(lookQuat);
						fingerQuat.setFromUnitVectors(lastUnit,upUnit);//up isn't used anyway; this definitely could be cleaned way way up
					} else {
						fingerQuat.setFromUnitVectors(forwardUnit,upUnit);
						lastUnit = upUnit.clone();
					}
					lastPos = fingerPos;
					lastQuat = fingerQuat;
				break;
				case 1://prim
					
				break;
				case 2://erase
					fingerQuat.setFromUnitVectors(forwardUnit,lastRay.direction);
				break;
				
			}
			
			
			return {
				fingerPos:fingerPos,
				fingerQuat:fingerQuat
			};
			
		},
		
		getBothPinching:function(){
			
			if (curMode != 1) return false;
			
			// keeping cursorWasDown logic here isn't going to be safe if other functions need the same check
			
			if (!cursorIsDown) {
				cursorWasDown = false;
				return false;
			}
			
			if (!cursorWasDown) {
				primMidpoint = getCursorWorld();
			}
			cursorWasDown = true;
			
			
			var rightPt = getCursorWorld();
			if (rightPt.x == primMidpoint.x && rightPt.y == primMidpoint.y && rightPt.z == primMidpoint.z) {// to avoid 0,0,0 altspace error
				rightPt.x += 0.01;
			}
			var gapToMid = new THREE.Vector3().subVectors(rightPt,primMidpoint);
			var leftPt = new THREE.Vector3().subVectors(primMidpoint,gapToMid);
			
			var rightQuat = lookAtQuat(gapToMid,upUnit);
			gapToMid.negate();
			var leftQuat = lookAtQuat(gapToMid,upUnit);
			
			
			return {
				rightPinch:rightPt,
				leftPinch:leftPt,
				rightQuat:rightQuat,
				leftQuat:leftQuat
			};
			
			
		},
		
		
		// also animates detonator attachment, in this case! maybe a weird place to put it, but it gets called every frame while relevant, so w/e
		getDetonatorPressed:function(){
			return false;
			/*
			
			if (isHandActive(otherHand)) {
				
				var detonatorHandInfo = skeletonInfo.getJoint('Hand',otherHand);
				
				//this is NOT strictly necessary since position is how it's being hidden right now anyway,
				//but for the sake of supporting changes to the show/hide system, let's put it in
				objShow(detonatorHolder);
				
				detonatorHolder.position.copy(detonatorHandInfo.position);
				detonatorHolder.quaternion.copy(detonatorHandInfo.quaternion);
				
				detonatorBase.rotation.y = (otherHand == 'Left') ? 0 : Math.PI ;
				
				detonatorIsPressed = !isThumbUp(otherHand);
				detonatorButtonUp.visible = !detonatorIsPressed;
				detonatorButtonDown.visible = detonatorIsPressed;
				
				oldDetonatorPressed = detonatorIsPressed;
				
			} else {
				
				objHide(detonatorHolder);
				
			}
			
			return oldDetonatorPressed;
			
			*/
		}
		
		
	};
	
}