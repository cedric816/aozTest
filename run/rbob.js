/*@*****************************************************************************
*                                                                              *
*   █████╗  ██████╗ ███████╗    ███████╗████████╗██╗   ██╗██████╗ ██╗ ██████╗  *
*  ██╔══██╗██╔═══██╗╚══███╔╝    ██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██╔═══██╗ *
*  ███████║██║   ██║  ███╔╝     ███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║ *
*  ██╔══██║██║   ██║ ███╔╝      ╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║ *
*  ██║  ██║╚██████╔╝███████╗    ███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝ *
*  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝    ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝  *
*                                                                              *
* This file is part of AOZ Studio.                                             *
* Copyright (c) AOZ Studio. All rights reserved.                               *
*                                                                              *
* Licensed under the GNU General Public License v3.0.                          *
* More info at: https://choosealicense.com/licenses/gpl-3.0/                   *
* And in the file AOZ_StudioCodeLicense.pdf.                                   *
*                                                                              *
*****************************************************************************@*/
/** @file
 *
 * AOZ - Bob Class
 *
 * @author FL (Francois Lionet)
 * @date first pushed on 10/11/2019
 */

function Bob( aoz, parent, tags )
{
	this.aoz = aoz;
	this.banks = aoz.banks;
	this.screen = parent;
	this.tags = tags;
	this.className = 'bob';

	this.vars =
	{
		X: 0,
		Y: 0,
		Z: 0,
		Angle: 0,
		Image: 0,
		Alpha: 1,
		Visible: true
	};
	this.varsUpdated =
	{
		X: undefined,
		Y: undefined,
		Z: undefined,
		Angle: undefined,
		Image: undefined,
		Alpha: undefined,
		Visible: undefined
	};
	this.dimension = { x: 0, y: 0, z: 0 };
	this.scale = { x: 1, y: 1, z: 1 };
	this.skew = { x: 0, y: 0, z: 0 };
	this.hRev = false;
	this.vRev = false;
	this.positionDisplay = {};
	this.dimensionDisplay = {};
	this.scaleDisplay = {};
	this.skewDisplay = {};
	this.angleDisplay = {};
	this.alpha = 1.0;
	this.hRevDisplay = false;
	this.vRevDisplay = false;
	this.bankIndex = undefined;
	this.bankReserveNumber = -1;

	this.clipping = null;
	this.limits = null;
	this.toUpdate = false;
	this.toUpdateCollisions = false;
	this.collisions =
	{
		rectangle: { x1: 10000000, y1: 10000000, x2: -10000000, y2: -10000000 },
		rectangleClamp: { x1: 10000000, y1: 10000000, x2: -10000000, y2: -10000000 }
	};
	this.makeObject();
}
Bob.prototype.set = function( position, image, fromInstruction )
{
	var toUpdate = 0;
	if ( typeof image != 'undefined' )
	{
		if ( typeof image == 'number' )
		{
			this.hRev = ( image & AOZ.HREV ) != 0;
			this.vRev = ( image & AOZ.VREV ) != 0;
			image &= ~( AOZ.HREV | AOZ.VREV );
		}
		else
		{
			this.hRev = false;
			this.vRev = false;
		}
		this.bank = this.aoz.banks.getBank( this.bankIndex, this.aoz.currentContextName, 'images' );
		this.bankIndex = this.bank.index;
		this.bankReserveNumber = this.bank.reserveNumber;
		this.vars.Image = image;
		this.imageObject = this.bank.getElement( this.vars.Image );
		this.dimension.width = this.imageObject.width * this.scale.x;
		this.dimension.height = this.imageObject.height * this.scale.y;
		toUpdate++;
	}
	if ( typeof position.x != 'undefined' )
	{
		this.vars.X = this.limits ? Math.max( this.limits.x, Math.min( this.vars.X, this.limits.x + this.limits.width ) ) : position.x;
		toUpdate++;
		if ( fromInstruction )
			this.varsUpdated.X = this.vars.X;
	}
	if ( typeof position.y != 'undefined' )
	{
		this.vars.Y = this.limits ? Math.max( this.limits.y, Math.min( this.vars.Y, this.limits.y + this.limits.height ) ) : position.y;
		toUpdate++;
		if ( fromInstruction )
			this.varsUpdated.Y = this.vars.Y;
	}
	if ( typeof position.z != 'undefined' )
	{
		this.vars.Z = position.z;
		toUpdate++;
		if ( fromInstruction )
			this.varsUpdated.Z = this.vars.Z;
	}
	if ( toUpdate > 0 )
		this.setModified();
};
Bob.prototype.setModified = function()
{
	this.toUpdate = true;
	this.toUpdateCollisions = true;
	this.screen.setModified();
};
Bob.prototype.updateBank = function( newBank, newBankIndex, contextName )
{
	if ( this.bankIndex == newBankIndex )
	{
		if ( newBank )
		{
			if ( this.bankReserveNumber != newBank.reserveNumber )
			{
				this.bank = newBank;
				this.bankReserveNumber = newBank.reserveNumber;
				this.imageObject = newBank.getElement( this.vars.Image );
				if ( !this.imageObject )
					this.destroy();
				else
				{
					this.dimension.width = this.imageObject.width * this.scale.x;
					this.dimension.height = this.imageObject.height * this.scale.y;
					this.setModified();
				}
				return true;
			}
		}
		else
		{
			this.destroy();
			return true;
		}
	}
};
Bob.prototype.destroy = function( options )
{
	this.screen.destroyBob( this.index );
	this.setModified();
};
Bob.prototype.update = function( options )
{
	if ( this.toUpdate || options.force )
	{
		this.toUpdate = false;
		if ( this.imageObject )
		{
			this.positionDisplay.x = this.vars.X;
			this.positionDisplay.y = this.vars.Y;
			this.dimensionDisplay.width = this.dimension.width;
			this.dimensionDisplay.height = this.dimension.height;
			this.scaleDisplay.x = this.scale.x;
			this.scaleDisplay.y = this.scale.y;
			this.skewDisplay.x = this.skew.x;
			this.skewDisplay.y = this.skew.y;
			this.angleDisplay.z = this.vars.Angle;
			this.canvas = this.imageObject.getCanvas( this.hRev, this.vRev );
			this.hotSpot = this.imageObject.getHotSpot( this.hRev, this.vRev );
		}
		return true;
	}
	return false;
};
Bob.prototype.setVisible = function( yesNo, fromInstruction )
{
	this.vars.Visible = yesNo;
	if ( fromInstruction )
		this.varsUpdated.Visible = visible;
	this.setModified();
};
Bob.prototype.setAlpha = function( alpha, fromInstruction )
{
	if ( alpha < 0 || alpha > 1 )
		throw 'illegal_function_call';
	this.vars.Alpha = alpha;
	if ( fromInstruction )
		this.varsUpdated.Alpha = alpha;
	this.setModified();
};
Bob.prototype.setClipping = function( rectangle, options )
{
	rectangle.x = typeof rectangle.x != 'undefined' ? rectangle.x : 0;
	rectangle.y = typeof rectangle.y != 'undefined' ? rectangle.y : 0;
	rectangle.width = typeof rectangle.width != 'undefined' ? rectangle.width : this.screen.width;
	rectangle.height = typeof rectangle.height != 'undefined' ? rectangle.height : this.screen.height;
	this.clipping = rectangle;
	this.setModified();
};
Bob.prototype.setLimits = function( rectangle, options )
{
	rectangle.x = typeof rectangle.x != 'undefined' ? rectangle.x : 0;
	rectangle.y = typeof rectangle.y != 'undefined' ? rectangle.y : 0;
	rectangle.width = typeof rectangle.width != 'undefined' ? rectangle.width : this.screen.width;
	rectangle.height = typeof rectangle.height != 'undefined' ? rectangle.height : this.screen.height;
	if ( this.aoz.platform == 'amiga' )
		rectangle.width &= 0xFFFFFFF0;
	this.limits = rectangle;
	this.clipping = rectangle;
	this.setModified();
};
Bob.prototype.setScale = function( vector, tags )
{
	vector.x = typeof vector.x == 'undefined' ? 1 : vector.x;
	vector.y = typeof vector.y == 'undefined' ? 1 : vector.y;
	vector.z = typeof vector.z == 'undefined' ? 1 : vector.z;
	this.scale = vector;
	this.setModified();
};
Bob.prototype.setSkew = function( vector, tags )
{
	vector.x = typeof vector.x == 'undefined' ? 0 : vector.x;
	vector.y = typeof vector.y == 'undefined' ? 0 : vector.y;
	vector.z = typeof vector.z == 'undefined' ? 0 : vector.z;
	this.skew = vector;
	this.setModified();
};
Bob.prototype.setAngle = function( angle, fromInstruction )
{
	//angle.x = typeof angle.x == 'undefined' ? 0 : angle.x;
	//angle.y = typeof angle.y == 'undefined' ? 0 : angle.y;	
	angle.z = typeof angle.z == 'undefined' ? 0 : angle.z;
	this.vars.Angle = angle.z;
	if ( fromInstruction )
		this.varsUpdated.Angle = angle.z;
	this.setModified();
};
Bob.prototype.updateCollisionData = function()
{
	if ( this.toUpdateCollisions )
	{
		var collisions = this.collisions;
		if ( this.imageObject )
		{
			var x1, x2, y1, y2;
			if ( this.scale.x >= 0 )
				x1 = this.vars.X - this.imageObject.hotSpotX * this.scale.x;
			else
				x1 = this.vars.X - ( this.imageObject.width - this.imageObject.hotSpotX ) * ( -this.scale.x );
			x2 = x1 + this.imageObject.width * Math.abs( this.scale.x );

			if ( this.scale.y >= 0 )
				y1 = this.vars.Y - this.imageObject.hotSpotY * this.scale.y;
			else
				y1 = this.vars.Y - ( this.imageObject.height - this.imageObject.hotSpotY ) * ( -this.scale.y );
			y2 = y1 + this.imageObject.height * Math.abs( this.scale.y );

			var x1Clamp = Math.max( Math.min( x1, this.screen.dimension.width ), 0 );
			var y1Clamp = Math.max( Math.min( y1, this.screen.dimension.height ), 0 );
			var x2Clamp = Math.max( Math.min( x2, this.screen.dimension.width ), 0 );
			var y2Clamp = Math.max( Math.min( y2, this.screen.dimension.height ), 0 );

			if ( x1Clamp != x2Clamp && y1Clamp != y2Clamp )
			{
				collisions.rectangle.x1 = x1 * this.screen.renderScale.x + this.screen.position.x;
				collisions.rectangle.y1 = y1 * this.screen.renderScale.y + this.screen.position.y;
				collisions.rectangle.x2 = x2 * this.screen.renderScale.x + this.screen.position.x;
				collisions.rectangle.y2 = y2 * this.screen.renderScale.y + this.screen.position.y;
				collisions.rectangleClamp.x1 = x1Clamp * this.screen.renderScale.x + this.screen.position.x;
				collisions.rectangleClamp.y1 = y1Clamp * this.screen.renderScale.y + this.screen.position.y;
				collisions.rectangleClamp.x2 = x2Clamp * this.screen.renderScale.x + this.screen.position.x;
				collisions.rectangleClamp.y2 = y2Clamp * this.screen.renderScale.y + this.screen.position.y;
				/*
				if ( this.angle.z != 0 )
				{
					var xCenter = this.position.x * this.screen.renderScale.x + this.screen.position.x;
					var yCenter = this.position.y * this.screen.renderScale.y + this.screen.position.y;
					this.utilities.rotateCollisionRectangle( this.collisions.rectangle, { x: xCenter, y: yCenter }, this.angle.z );
					this.utilities.rotateCollisionRectangle( this.collisions.rectangleClamp, { x: xCenter, y: yCenter }, this.angle.z );
				}
				*/
			}
		}
		else
		{
			collisions.rectangle = { x1: 10000000, y1: 10000000, x2: -10000000, y2: -10000000 };
			collisions.rectangleClamp = { x1: 10000000, y1: 10000000, x2: -10000000, y2: -10000000 };
		}
		collisions.xPlus = this.scale.x;
		collisions.yPlus = this.scale.y;
		this.toUpdateCollisions = false;
	}
};

///////////////////////////////////////////////////////////////////////////
// Animation channel entries
///////////////////////////////////////////////////////////////////////////
Bob.prototype.getThis = function( index ){ return this.aoz.currentScreen.getBob( index, undefined, this.aoz.currentContextName ); };
Bob.prototype.get_X = function( force ) 
{ 
	if ( force )
		return this.vars.X;
	var x = this.varsUpdated.X;
	if ( typeof x != 'undefined' )
	{
		this.varsUpdated.X = undefined;
		return x;
	}
	return undefined; 
};
Bob.prototype.get_Y = function( force ) 
{ 
	if ( force )
		return this.vars.Y;
	var y = this.varsUpdated.Y;
	if ( typeof y != 'undefined' )
	{
		this.varsUpdated.Y = undefined;
		return y;
	}
	return undefined; 
};
Bob.prototype.get_Image = function( force ) 
{ 
	if ( force )
		return this.vars.Image;
	var image = this.varsUpdated.Image;
	if ( typeof image != 'undefined' )
	{
		this.varsUpdated.Image = undefined;
		return image;
	}
	return undefined; 
};
Bob.prototype.get_Angle = function() 
{ 
	var angle = this.varsUpdated.Angle;
	if ( typeof angle != 'undefined' )
	{
		this.varsUpdated.Angle = undefined;
		return angle;
	}
	return undefined; 
};
Bob.prototype.get_Alpha = function( force )
{
	if ( force )
		return this.vars.Alpha;
	var alpha = this.varsUpdated.Alpha;
	if ( typeof alpha != 'undefined' )
	{
		this.varsUpdated.Alpha = undefined;
		return alpha;
	}
	return undefined; 
};
Bob.prototype.get_Visible = function( force )
{
	if ( force )
		return this.vars.Visible;
	var visible = this.varsUpdated.Visible;
	if ( typeof visible != 'undefined' )
	{
		this.varsUpdated.Visible = undefined;
		return visible;
	}
	return undefined; 
};
Bob.prototype.set_X = function( x, fromInstruction ) { this.set( { x: x }, undefined, fromInstruction ); };
Bob.prototype.set_Y = function( y, fromInstruction ) { this.set( { y: y }, undefined, fromInstruction ); };
Bob.prototype.set_Image = function( image, fromInstruction ) { this.set( {}, image, fromInstruction ); };
Bob.prototype.set_Angle = function( angle, fromInstruction ) { this.setAngle( { z: angle }, fromInstruction ); };
Bob.prototype.set_Visible = function( visible, fromInstruction ) { this.setVisible( visible, fromInstruction ); };
Bob.prototype.set_Alpha = function( alpha, fromInstruction ) { this.setAlpha( alpha, fromInstruction ); };


///////////////////////////////////////////////////////////////////////////
// Object-oriented entries
///////////////////////////////////////////////////////////////////////////
Bob.prototype.makeObject = function()
{
	this.getThis = Bob.prototype.getThis;
	this.get_X = Bob.prototype.get_X;
	this.get_Y = Bob.prototype.get_Y;
	this.set_X = Bob.prototype.set_X;
	this.set_Y = Bob.prototype.set_Y;
	this.set_Angle = Bob.prototype.set_Angle;
	this.get_Angle = Bob.prototype.get_Angle;
	this.get_Image = Bob.prototype.get_Image;
	this.set_Image = Bob.prototype.set_Image;
	this.get_Alpha = Bob.prototype.get_Alpha;
	this.set_Alpha = Bob.prototype.set_Alpha;

	this.m_scale=function(aoz,parent,args)
	{
		this.aoz=aoz;
		this.className="scale";
		this.category="method";
		this.parent=parent;
		this.vars=(typeof args=="undefined"?{}:args);
		this.blocks=
		[
			function(aoz,vars)
			{
				this.parent.setScale( { x: vars.arg0, y: vars.arg1, z: vars.arg2 }, true );
				return{type:0}
			}
		]
	};
	this.m_rotate=function(aoz,parent,args)
	{
		this.aoz=aoz;
		this.className="rotate";
		this.category="method";
		this.parent=parent;
		this.vars=(typeof args=="undefined"?{}:args);
		this.blocks=
		[
			function(aoz,vars)
			{
				this.parent.setAngle( { x: 0, y: 0, z: vars.arg0 * aoz.degreeRadian }, true );
				return{type:0}
			}
		]
	};
	this.m_skew=function(aoz,parent,args)
	{
		this.aoz=aoz;
		this.className="skew";
		this.category="method";
		this.parent=parent;
		this.vars=(typeof args=="undefined"?{}:args);
		this.blocks=
		[
			function(aoz,vars)
			{
				this.parent.setSkew( { x: vars.arg0, y: vars.arg1, z: vars.arg2 }, true );
				return{type:0}
			}
		]
	};
	this.m_collide=function(aoz,parent,args)
	{
		this.aoz=aoz;
		this.className="collide";
		this.category="method";
		this.parent=parent;
		this.vars=(typeof args=="undefined"?{}:args);
		this.blocks=
		[
			function(aoz,vars)
			{
				var strings = [];
				for ( var count = 0; ; count ++ )
				{
					if ( !vars[ 'argType' + count ] )
						break;
					if ( vars[ 'argType' + count ] != '2' )
						throw 'type_mismatch';
					strings.push( vars[ 'arg' + count ] );
				}
				aoz.moduleCollisions.setCollide( 'bob', this.parent, strings );
				return{type:0}
			}
		]
	};
	this.m_collide_with=function(aoz,parent,args)
	{
		this.aoz=aoz;
		this.className="collide_with";
		this.category="method";
		this.parent=parent;
		this.vars=(typeof args=="undefined"?{}:args);
		this.blocks=
		[
			function(aoz,vars)
			{
				var strings = [];
				for ( var count = 0; ; count ++ )
				{
					if ( !vars[ 'argType' + count ] )
						break;
					if ( vars[ 'argType' + count ] != '2' )
						throw 'type_mismatch';
					strings.push( vars[ 'arg' + count ] );
				}
				aoz.moduleCollisions.setCollideWith( 'bob', this.parent, strings );
				return{type:0}
			}
		]
	};
	this.m_hide=function(aoz,parent,args)
	{
		this.aoz=aoz;
		this.className="hide";
		this.category="method";
		this.parent=parent;
		this.vars=(typeof args=="undefined"?{}:args);
		this.blocks=
		[
			function(aoz,vars)
			{
				this.parent.vars.visible = false;
				return{type:0}
			}
		]
	};
	this.m_show=function(aoz,parent,args)
	{
		this.aoz=aoz;
		this.className="show";
		this.category="method";
		this.parent=parent;
		this.vars=(typeof args=="undefined"?{}:args);
		this.blocks=
		[
			function(aoz,vars)
			{
				this.parent.vars.visible = true;
				return{type:0}
			}
		]
	};
	this.m_off=function(aoz,parent,args)
	{
		this.aoz=aoz;
		this.className="off";
		this.category="method";
		this.parent=parent;
		this.vars=(typeof args=="undefined"?{}:args);
		this.blocks=
		[
			function(aoz,vars)
			{
				this.parent.screen.destroyBob( this.parent.index );
				return{type:0}
			}
		]
	};
};
