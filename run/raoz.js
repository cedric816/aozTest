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
 * AOZ Runtime
 *
 * The return of Basic!
 *
 * @author FL (Francois Lionet)
 * @date first pushed on 03/12/2018
 */
AOZ_Files = {};
function AOZ( canvasId, manifest )
{

	//this.dos = new DOS( this );
	//this.utilities = new Utilities( this );
	var self = this;
	this.aoz = this;
	this.atom = undefined;
	this.currentContextName = 'application';
	this.manifest = manifest;
	this.memoryHashMultiplier = 1000000000000;
	this.loadingCount = 0;
	this.loadingMax = 0;
	this.finalWait = 0;
	this.use = {};
	this.directMode = false;
	this.directModeCommand = null;
	this.directModeNumber = 0;

	this.utilities = new Utilities( this );
	this.errors = new Errors( this );
	this.banks = new Banks( this );
	this.filesystem = new Filesystem( this );
	this.renderer = new Renderer( this, canvasId );
	this.amal = new AMAL( this );
	this.fonts = new Fonts( this );

	this.keyShift = 0; // "global" version of Key Shift bitmap. BJF 19 Aug
	this.setKeyboard();
	this.setMouse();
	this.setGamepads();	// Called upon startup.  This will initialize the gamepad objects.  BJF
	this.gamepad_Threshold=0.2;	// Default 20% 
	this.gamepad_Keyboard=true;	// Keypad ON
	this.gamepad_AutoFire=true;	// AutoFire ON
	this.gamepad_AutoMove=true;	// AutoMove ON

	this.gamepads = {};
	this.sections = [];
	this.returns = [];
	this.section = null;
	this.position = 0;
	this.parent = null;
	this.maxLoopTime = 1000;
	this.timeCheckCounter = 100000;
	this.refreshTrigger = 100000;
	this.refreshCounter = 0;
	this.manifest = manifest;
	this.onError = false;
	this.resume = 0;
	this.resumeLabel = 0;
	this.isErrorOn = false;
	this.isErrorProc = false;
	this.lastError = 0;
	this.displayEndAlert = this.aoz.manifest.compilation.displayEndAlert ? true : false;
	this.displayErrorAlert = this.aoz.manifest.compilation.displayErrorAlert ? true : false;
	this.fix = 16;
	this.degreeRadian=1.0;
	this.key$ = [];
	for ( var k = 0; k < 20; k++ )
		this.key$[ k ] = '';
	this.stringKey$ = '';
	this.handleKey$ = null;
	this.results = [];
	this.inkeyShift = 0; // BJF For ScanShift states?
	this.memoryBlocks = [];
	this.memoryNumbers = 1;
	this.everyPile = [];
	this.fps = [];
	this.fpsPosition = 0;
	this.frameCounter = 0;
	for ( var f = 0; f < 50; f++ )
		this.fps[ f ] = 20;
	this.channelsTo = [];
	this.amalErrors = [];
	this.amalErrorNumberCount = 0;
	this.amalErrorStringCount = 0;
	this.channelBaseSprites = 1000000;
	this.channelBaseBobs = 2000000;
	this.updateEvery = 0;
	this.updateEveryCount = 0;
	this.isUpdate = true;
	this.blocks = [];
	this.cBlocks = [];
	this.setBufferSize = 0;
	this.xMouse = 0;
	this.yMouse = 0;
	this.synchroList = [];
	this.joyLock = {};
	this.touchEmulation = 
	{
		active: true,
		fingerOnScreen: false,
		lastX: -1,
		lastY: -1
	};
	this.everyPile = [];
	this.everyCount = 0;
	this.everyOn = false;
	this.objectCount = 0;
	//this.renderer.setScreenDisplay();

	// Get crucial values from manifest
	this.platform = manifest.compilation.platform.toLowerCase();
	this.platformKeymap = manifest.compilation.keymap;
	this.machine = manifest.compilation.machine;
	this.endian = manifest.compilation.endian;
	this.usePalette = true;
	this.useShortColors				= ( this.platform == 'amiga' ); // OR useShortColors tag is true BJF
	this.showCopperBlack			= ( this.platform == 'amiga' && this.machine == 'classic' );
	this.unlimitedScreens			= ( this.platform == 'amiga' && this.machine == 'classic' );
	this.unlimitedWindows			= ( this.platform == 'amiga' && this.machine == 'classic' );
	this.maskHardwareCoordinates	= ( this.platform == 'amiga' && this.machine == 'classic' );
	this.platformTrue = this.platform == 'amiga' ? -1 : true;
	this.defaultPalette = [];
	if ( this.usePalette )
	{
		for ( var c = 0; c < this.manifest.default.screen.palette.length; c++ )
			this.defaultPalette[ c ] = this.manifest.default.screen.palette[ c ];
	}

	this.waitInstructions =
	{
		waitKey: this.waitKey,
		waitKey_wait: this.waitKey_wait,
		wait: this.wait,
		wait_wait: this.wait_wait,
		waitVbl: this.waitVbl,
		waitVbl_wait: this.waitVbl_wait,
		input: this.input,
		input_wait: this.input_wait,
		input$: this.input$,
		input$_wait: this.input$_wait,
		amalStart: this.amalStart,
		amalStart_wait: this.amalStart_wait,
		setFont: this.setFont,
		setFont_wait: this.setFont_wait
	};

	// Initialisation of mathematic functions
	Math.tanh = Math.tanh || function( x )
	{
		var a = Math.exp( +x ), b = Math.exp( -x );
		return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (a + b);
	};
	Math.sinh = Math.sinh || function( x )
	{
		return ( Math.exp( x ) - Math.exp( -x ) ) / 2;
	};
	Math.cosh = Math.cosh || function( x )
	{
		return ( Math.exp( x ) + Math.exp( -x ) ) / 2;
	};

	// Main loop
	this.break = false;
	this.breakOn = true;

	// Create contexts
	this.screensContext = new AOZContext( this.aoz, this.currentContextName, { sorted: true } );
	this.spritesContext = new AOZContext( this.aoz, this.currentContextName, { sorted: true } );

	// Is the runtime connected to Python?
	var self = this;
	window.addEventListener( 'pywebviewready', listenToSnakes );
	this.pythonIsReady = false;
	function listenToSnakes() 
	{
		console.log( "Snakes! :)" );
		self.pythonIsReady = true;
		setTimeout( function()
		{
			// Set the parameters of the application
			self.callPython( 'windowTitle', [ self.manifest.infos.applicationName ] );
			self.callPython( 'windowResize', [ self.manifest.display.width, self.manifest.display.height ] );
			if ( self.manifest.display.fullScreen )
				self.callPython( 'toggleFullScreen', [ ] );
		}, 1 );
    };

	// Load welcome images
	var images = [];
	var imageCount = 5;
	var welcomeStep = 0;
	var welcomeWaitEnd = 0;
	var welcomeAlpha = 0;
	this.welcomeClick = false;
	if ( this.manifest.bootScreen.active )
	{
		for ( var i = 0; i < 8; i++ )
		{
			this.utilities.loadUnlockedImage( "./run/resources/made_with_aoz_" + i + ".png", {}, function ( response, image, count )
			{
				if ( response )
				{
					images[ count ] = image;
					imageCount--;
					if ( imageCount == 0 )
						welcomeStep = 1;
				}
			}, i );
		}
	}
	else
	{
		welcomeStep = -100;
	}

	// Wait for initiialization / display welcome screen...
	var handle = setInterval( function()
	{
		if ( welcomeStep >= 0 )
		{
			// Wait?
			var now = new Date().getTime();
			if ( welcomeWaitEnd )
			{
				if ( now > welcomeWaitEnd )
				{
					welcomeStep++;
					welcomeWaitEnd = 0;
				}
				return;
			}
			else
			{
				// Step!
				var welcomeWait = 0;
				switch ( welcomeStep )
				{
					case 0:
						break;
					case 1:
						// White renderer screem
						self.renderer.context.fillStyle = self.utilities.getRGBAString( welcomeAlpha, welcomeAlpha, welcomeAlpha );
						self.renderer.context.fillRect( 0, 0, self.renderer.canvas.width, self.renderer.canvas.height );
						welcomeAlpha += 5;
						if ( welcomeAlpha >= 256 )
						{
							self.renderer.context.fillStyle = '#FFFFFF';
							self.renderer.context.fillRect( 0, 0, self.renderer.canvas.width, self.renderer.canvas.height );
							welcomeWait = 100;
						}
						break;
					case 2:
						drawI( images[ 0 ], 144, -89, 1.0 );
						drawI( images[ 1 ], 225, -89, 1.0 );
						drawI( images[ 2 ], -165, 0, 1.0 );
						welcomeStep = 4;
						welcomeAlpha = 0;
						break;
					case 3:
						break;
					case 4:
						drawI( images[ 3 ], 110, 15, welcomeAlpha );
						welcomeAlpha += 0.03;
						if ( welcomeAlpha >= 1 )
							welcomeWait = 500;
						break;
					case 5:
						welcomeStep = -7;
						break;
					case 6:
						welcomeStep++;
						break;
					case 7:
						if ( self.useSounds || self.manifest.bootScreen.waitSounds )
						{
							if( 'ontouchstart' in window || navigator.maxTouchPoints )
							{
								drawI( images[ 7 ], 0, -48, 1.0, '#bottom' );
							}
							else
							{
								drawI( images[ 6 ], 0, -48, 1.0, '#bottom' );
							}
							welcomeStep++;
							break;
						}
						else
						{
							drawI( images[ 4 ], 110, 15, 1.0 );
							drawI( images[ 5 ], 247, 110, 1.0 );
							welcomeStep = 99;
							welcomeWait = 1000;
						}
						break;
					case 8:
						if ( self.welcomeClick )
						{
							if( 'ontouchstart' in window || navigator.maxTouchPoints )
							{
								drawI( images[ 7 ], 0, -48, 1.0, '#nodraw #bottom' );

							}
							else
							{
								drawI( images[ 6 ], 0, -48, 1.0, '#nodraw #bottom' );
							}
							drawI( images[ 4 ], 110, 15, 1.0 );
							drawI( images[ 5 ], 247, 110, 1.0 );
							welcomeWait = 1000;
							welcomeStep = 99;
						}
						break;
					case 99:
						break;
					case 100:
						clearInterval( handle );
						self.default( 'application' );
						self.timer = 0;
						window.requestAnimationFrame( doUpdate );
						break;
				}
				if ( welcomeWait )
					welcomeWaitEnd = now + welcomeWait;
			}
			return;
		}
		if ( self.loadingCount == self.loadingMax )
		{
			if ( self.loadingError )
			{
				clearInterval( handle );
				var message = self.errors.getError( self.loadingError ).message;
				alert( message );
			}
			else
			{
				if ( self.loadingCount != 0 )
				{
					self.loadingCount = 0;
					self.loadingMax = 0;
					welcomeStep = -welcomeStep;
				}
			}
		}
		function drawI( image, x, y, alpha, options )
		{
			self.renderer.context.imageSmoothingEnabled = true;
			self.renderer.context.imageRendering = 'pixelated';
			var ratioX = ( self.renderer.width / 1280 ) * 0.6;
			var ratioY = ratioX;
			var xx = self.renderer.width / 2;
			var yy = self.renderer.height / 2;
			if ( options && options.indexOf( '#bottom' ) >= 0 )
				yy = self.renderer.height;
			self.renderer.context.fillStyle = '#FFFFFF';
			self.renderer.context.globalAlpha = 1;
			self.renderer.context.fillRect( xx + ( x - image.width / 2 ) * ratioX, yy + ( y - image.height / 2 ) * ratioY, image.width * ratioX, image.height * ratioY );
			if ( !( options && options.indexOf( '#nodraw' ) >= 0 ) )
			{
				self.renderer.context.globalAlpha = alpha;
				self.renderer.context.drawImage( image, 0, 0, image.width, image.height, xx + ( x - image.width / 2 )* ratioX, yy + ( y - image.height / 2 ) * ratioY, image.width * ratioX, image.height * ratioY );
			}
		}
	}, 20 );

	function doUpdate()
	{
		if( !self.already_fs && self.is_touch && self.manifest.display.fullScreen )
		{
			var elem = self.renderer.canvas;
			if ( elem.requestFullscreen ) 
			{
				elem.requestFullscreen();
			} 
			else if ( elem.mozRequestFullScreen ) 
			{
				elem.mozRequestFullScreen();
			} 
			else if ( elem.webkitRequestFullscreen ) 
			{
				elem.webkitRequestFullscreen();
			} 
			else if ( elem.msRequestFullscreen ) 
			{
				elem.msRequestFullscreen();
			}
			self.already_fs = true;
		}

		if ( self.section )
		{
			var time = new Date().getTime();
			if ( !self.previousTime ) 
				self.previousTime = time;
			self.fps[ self.fpsPosition++ ] = time - self.previousTime;
			self.fpsPosition = self.fpsPosition >= self.fps.length ? 0 : self.fpsPosition;
			self.timer += self.platform == 'aoz' ? ( time - self.previousTime ) / 1000 : ( time - self.previousTime ) / 20;
			self.frameCounter++;
			self.scanGamepads();
			self.doSynchro( time - self.previousTime );
			self.previousTime = time;

			// Run current set of blocks
							try
							{
				self.section = self.runBlocks( self.section, true );
							}
				catch ( error )
							{
					self.handleErrors( error );
					}

			// Render the display
			self.renderer.render();

			// Handle interruption...
			if ( !self.section || self.break )
			{
				self.break = true;
				if ( self.section )
					self.section.waiting = null;

				// Force render
				self.renderer.blackAtFirstCount = 0;
				self.renderer.render( true );

				// Stop update
				clearInterval( self.handle );

				var message = '';
				if ( self.lastError )
				{
					message = self.errorObject.message;
					if ( self.lastErrorPos )
					{
						var pos = self.lastErrorPos.split( ':' );
						var number = parseInt( pos[ 0 ] );
						var path = self.sources[ number ].path;
						var line = parseInt( pos[ 1 ] ) + 1;
						var column = parseInt( pos[ 2 ] ) + 1;
						message += ' ' + self.errors.getError( 'at_line' ).message + line + ', ';
						message += self.errors.getError( 'at_column' ).message + column + ' ';
						message += self.errors.getError( 'in_source' ).message + self.utilities.getFilename( path ) + '.' + self.utilities.getFilenameExtension( path );
					}
					message += '.';
					console.log( message );
				}

				var flashingText = null;
				if ( !self.directMode )
				{
					line = '.';
					if ( self.sourcePos )
					{
						var pos = self.sourcePos.split( ':' );
						line = ' at line ' + ( parseInt( pos[ 1 ] ) + 1 );
					}
					if ( self.section == null )
						flashingText = 'Program ended';
					else
						flashingText = self.badEnd ? 'Program interrupted' : 'Program ended';
					flashingText += line;
				}
				var display = false;
				var displayText = '';
				if ( !self.directMode && message != '' )
				{
					// An error...
					displayText = message + '\n' + flashingText;
					if ( self.displayErrorAlert )
						display = true;
				}
				else
				{
					// End of program...
					displayText = flashingText
					if ( self.displayEndAlert )
						display = true;
				}
				if ( display )
				{
					setTimeout( function()
					{
						alert( displayText );
					}, 500 );
				}
				else
				{
					// Put program on "HALT"
					var count = 0;
					var speed = 60;
					var visible = 0;
					self.renderer.viewOn = true;
					function onHalt( doUpdate )
					{
						var time = new Date().getTime();
						self.fps[ self.fpsPosition++ ] = time - self.previousTime;
						self.fpsPosition = self.fpsPosition >= self.fps.length ? 0 : self.fpsPosition;
						self.timer += self.platform == 'aoz' ? ( time - self.previousTime ) / 1000 : ( time - self.previousTime ) / 20;
						self.doSynchro( time - self.previousTime );
						self.previousTime = time;
			
						count++;
						if ( count == speed )
						{
							count = 0;
							visible = 1 - visible;
							self.renderer.halted = visible ? flashingText : null;
							self.renderer.modified = true;
						}
						self.renderer.render();

						// If new command from direct mode-> load the source and execute it!
						var command;
						try
						{							
							if ( window.parent != null && window.parent.atom != null )						
								command = window.parent.atom.aozAPI.getDirectCommand();
						}
						catch ( err )
						{
						}
						if ( command )
						{
							// Save and load code as blob
							var name = 'AOZ_DirectCommand_' + ( ++self.directModeNumber );
							var code = self.utilities.replaceStringInText( command, '%$NAME', name );
							var script = document.createElement( 'script' );
							script.textContent = code;
							document.body.appendChild( script );
							self.directModeCommand = null;
							self.break = false;
							console.log( code );

							// Wait for source to be loaded
							var handle = setInterval( function()
							{
								if ( typeof Application[ name ] != 'undefined' )
								{
									clearInterval( handle );
									self.sections.push( null );
									var section = self.root;
									Application[ name ].call( section );
									section.position = 0;
									try
									{
										self.runBlocks( section, true );
									}
									catch ( error )
									{
										self.handleErrors( error );
										var message = '';
										if ( self.lastError )
										{
											message = self.errorObject.message;
											message += '.';
											self.printToDirectMode( message )
										}						
									}
									self.renderer.halted = null;
									self.renderer.render();
									window.requestAnimationFrame( onHalt );
								}
							}, 20 );
						}
						else
						{
							window.requestAnimationFrame( onHalt );
						}
					};
					window.requestAnimationFrame( onHalt );
				}
			}
			else
			{
				timeBefore = new Date().getTime();
				window.requestAnimationFrame( doUpdate );
			}
		}
	}
};
AOZ.prototype.runProcedure = function( name, args )
{
	name = 'p_' + name;
	if ( this.root[ name ] )
	{
		// Push previous section
		this.sections.push( null );				// Force return
	
		// Initialize procedure parameters
		var newSection = new this.root[ name ]( this, this.section, args );
		newSection = this.initSection( newSection );
		try
		{
			this.runBlocks( newSection, false );
		}
		catch( error )
		{
			this.handleErrors( error );
		}
		return true;
	}
	return false;
};
AOZ.prototype.runBlocks = function( section, allowWaiting )
{
	var ret;
	var quit = false;
	if ( !section.initialized )
		section = this.initSection( section );
	var loopCounter = this.timeCheckCounter;
	var time, entryTime;
	if ( allowWaiting )
		entryTime = new Date().getTime();
	var count = 0;
	do
	{
		this.currentSection = section;
		if ( section.waiting )
		{
			if ( !section.waiting.call( section.waitThis ) )
			{
				quit = true;
				break;
		}
			section.waiting = null;
		}
		while( !ret )
		{
			ret = section.blocks[ section.position++ ].call( section, this, section.vars );
		};

		switch ( ret.type )
		{
			// End
			case 0:
				section = this.popSection( section );
				break;

			// Goto
			case 1:
				section.position = ret.label;
				break;

			// Gosub
			case 2:
				section.returns.push( ret.return );
				section.position = ret.label;
				break;

			// Return
			case 3:
				if ( section.returns.length == 0 )
					throw 'return_without_gosub';
				section.position = section.returns.pop();

				// End of Every gosub?
				if ( section.position < 0 )
				{
					section.position = -section.position - 1;
					quit = true;
				}
				break;

			// Procedure call
			case 4:
				this.sections.push( section );
				var newSection = new section.root[ 'p_' + ret.procedure ]( this, section, ret.args );				
				section = this.initSection( newSection );
				break;

			// Resume
			case 5:
				if ( !section.isErrorOn && !section.isErrorProc )
				{
					throw 'resume_without_error';
				}
				else
				{
					if ( this.isErrorProc )
						section = this.popSection( section );
					if ( !ret.label )
						section.position = section.resume - 1;
					else
						section.position = ret.label;
					section.isErrorOn = false;
				}
				break;

			// Resume next
			case 6:
				if ( !section.isErrorOn && !section.isErrorProc )
				{
					throw 'resume_without_error';
				}
				else
				{
					if ( section.isErrorProc )
						section = popSection( section );
					section.position = section.resume;
					section.isErrorOn = false;
				}
				break;

			// Resume label
			case 7:
				if ( !section.isErrorOn && !section.isErrorProc )
				{
					throw 'resume_without_error';
				}
				else
				{
					if ( section.isErrorProc )
						section = this.popSection( section );
					section.position = section.resumeLabel;
					section.isErrorOn = false;
				}
				break;

			// Blocking instruction
			case 8:
				if ( !allowWaiting )
					throw 'cannot_wait_in_event_procedures';
				section.waiting = this.waitInstructions[ ret.instruction + '_wait' ];
				section.waitThis = this;
				this.waitInstructions[ ret.instruction ].call( this, ret.args );
				break;

			// Blocking function
			case 9:
				if ( !allowWaiting )
					throw 'cannot_wait_in_event_procedures';
				section.waiting = this.waitInstructions[ ret.instruction + '_wait' ];
				section.waitThis = this;
				this.waitInstructions[ ret.instruction ].call( this, ret.result, ret.args );
				break;

			// Instruction
			case 10:
				this.sections.push( section );
				var newSection = new section.root[ 'i_' + ret.instruction ]( this, section, ret.args );
				section = this.initSection( newSection, ret );
				break;

			// Function
			case 11:
				this.sections.push( section );
				var newSection = new section.root[ 'f_' + ret.instruction ]( this, section, ret.args );
				section = this.initSection( newSection, ret );
				break;

			// Blocking instruction from language definition
			case 12:
				if ( !allowWaiting )
					throw 'cannot_wait_in_event_procedures';
				section.waitThis = ret.waitThis;
				section.waiting = ret.waitThis[ ret.waitFunction ];
				section.waitThis[ ret.callFunction ].call( section.waitThis, ret.args );
				break;

			// Pop
			case 13:
				if ( this.returns.length == 0 )
					throw 'return_without_gosub';
				section.returns.pop();
				break;

			// Edit
			case 14:
				this.break = true;
				this.displayEndAlert = false;
				break;

			// Creation of an object
			case 15:
				this.sections.push( section );
				var newSection = new this.root[ 'o_' + ret.object ]( this, section, ret.args );
				section.results[ ret.result ] = newSection;
				section = this.initSection( newSection, ret );		// Will execute block[ 0 ]-> constructor.
				section = this.makeSectionObject( section );
				section.synchroOn = false;
				this.addToSynchro( section );
				break;

			// End / Break inside of procedures
			case 16:
				this.popSection( section );
				section = null;
				break;

			// Call of a object derivative method
			case 17:
				section.nextError = false;
				var method = ret.parent[ 'm_' + ret.method ];
				if ( method )
				{
					this.sections.push( section );
					var newSection = new method( this, ret.parent, ret.args );
					section = this.initSection( newSection, ret );
					break;
				}
				throw 'method_not_found';

			// Direct call of a object method, with array list of parameters
			case 18:
				section.nextError = false;
				var method = ret.parent[ 'm_' + ret.method ];
				if ( method )
				{
					this.sections.push( section );
					var args = {};
					for ( var p = 0; p < ret.args.length / 2; p++ )
					{
						args[ 'arg' + p ] = ret.args[ p * 2 ];
						args[ 'argType' + p ] = ret.args[ p * 2 + 1 ];
					}
					var newSection = new method( this, ret.parent, args );
					section = this.initSection( newSection );
					break;
				}
				throw 'method_not_found';

			// End the program in direct mode.
			case 19:
				section.waiting = function(){ return false; };
				section.waitThis = this;
				var self = this;				
				setTimeout( function()
				{
					self.break = true;
					self.displayEndAlert = false;
					try
					{
						if ( window.parent && window.parent.atom && window.parent.atom.openDirectMode )
						{
							window.parent.atom.openDirectMode( true );
							self.directMode = true;
						}
					}
					catch( err )
					{	
					}
				}, 100 );
				break;

		}
		ret = null;		

		// Never more than... X frames (depending on manifest settings)		
		if ( allowWaiting )
		{
			time = new Date().getTime();
			loopCounter--;
			if ( loopCounter <= 0 || time - entryTime > this.maxLoopTime )
				break;
		}
	} while( section && !quit && !this.break ) 

	return section;
};
AOZ.prototype.run = function( section, position, parent )
{
	if ( this.sections.length == 0 )
		this.root = section;
	this.sections.push( this.section );
	this.section = this.initSection( section );
	this.section.position = position;
	this.section.parent = parent;
	this.section.waiting = null;

	if ( parent )
		this.section.root = parent.root;
};
AOZ.prototype.initSection = function( section, ret )
{
	if ( ret )
			{
		section.currentResult = ret.result;
			}
	section.results = [];
	section.returns = [];
	section.onError = false;
	section.isErrorProc = false;
	section.lastError = 0;
	section.position = 0;
	section.initialized = true;
	section.nextError = null;

	// Find a sub-object
	section.getObject = function( index )
	{
		var thisArray = this.parent[ this.className ];
		if ( !thisArray )
			thisArray = this.parent[ this.objectName ];
		if ( !thisArray )
			throw 'object_not_found';
		if ( !thisArray[ index ] )
			throw 'object_not_found';
		return thisArray[ index ];
	};
	return section;
}
AOZ.prototype.makeSectionObject = function( section )
{
	section.objectNumber = this.objectCount++;

	if ( typeof section.vars.X == 'undefined' )
		section.vars.X = 0;
	if ( typeof section.vars.Y == 'undefined' )
		section.vars.Y = 0;
	if ( typeof section.vars.Z == 'undefined' )
		section.vars.Z = 0;
	if ( typeof section.vars.Angle == 'undefined' )
		section.vars.Angle = 0;
	if ( typeof section.vars.Alpha == 'undefined' )
		section.vars.Alpha = 0;
	if ( typeof section.vars.Visible == 'undefined' )
		section.vars.Visible = 0;

	section.varsUpdated = 
	{
		X: section.vars.X,
		Y: section.vars.Y,
		Z: section.vars.Z,
		Angle: section.vars.Angle,
		Alpha: section.vars.Alpha,
		Visible: section.vars.Visible
	}
	section.getThis = function(){ return this; };
	section.get_X = function( force ) 
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
	section.get_Y = function( force ) 
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
	section.get_Z = function( force ) 
	{ 
		if ( force )
			return this.vars.Z;
		var y = this.varsUpdated.Z;
		if ( typeof z != 'undefined' )
		{
			this.varsUpdated.Z = undefined;
			return z;
		}
		return undefined; 
	};
	section.get_Image = function( force ) 
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
	section.get_Angle = function() 
	{ 
		var angle = this.varsUpdated.Angle;
		if ( typeof Angle != 'undefined' )
		{
			this.varsUpdated.Angle = undefined;
			return angle;
		}
		return undefined; 
	};
	section.get_Alpha = function( force )
	{
		if ( force )
			return this.vars.Alpha;
		var alpha = this.varsUpdated.Alpha;
		if ( typeof Alpha != 'undefined' )
		{
			this.varsUpdated.Alpha = undefined;
			return alpha;
		}
		return undefined; 
	};
	section.get_Visible = function( force )
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
	section.set_X = function( x, fromInstruction ) 
	{ 
		this.vars.X = x;
		if ( fromInstruction )
			this.varsUpdated.X = x;
	};
	section.set_Y = function( y, fromInstruction )
	{ 
		this.vars.Y = y;
		if ( fromInstruction )
			this.varsUpdated.Y = y;
	};
	section.set_Z = function( z, fromInstruction )
	{ 
		this.vars.Z = z;
		if ( fromInstruction )
			this.varsUpdated.Z = z;
	};
	section.set_Image = function( image, fromInstruction )
	{ 
		this.vars.Image = image;
		if ( fromInstruction )
			this.varsUpdated.Image = image;
	};
	section.set_Angle = function( angle, fromInstruction )
	{ 
		this.vars.Angle = angle;
		if ( fromInstruction )
			this.varsUpdated.Angle = angle;
	};
	section.set_Visible = function( visible, fromInstruction )
	{ 
		this.vars.Visible = visible;
		if ( fromInstruction )
			this.varsUpdated.Visible = visible;
	};
	section.set_Alpha = function( alpha, fromInstruction )
	{ 
		this.vars.Alpha = alpha;
		if ( fromInstruction )
			this.varsUpdated.Alpha = alpha;
	};
	return section;
}
AOZ.prototype.popSection = function( currentSection )
{
	// If object constructor takes a long time-> no synchro before end!
	currentSection.synchroOn = true;

	// Do the pop!
	var pop = this.sections.pop();
	if ( pop )
			{
		if ( this.finalWait )
				{
			this.finalWait--;
			if ( this.finalWait == 0 )
					{
				this.waitThis = this;
				this.waiting = this.waitForFinalLoad;
				}
			}
		}
	return pop;
};
AOZ.prototype.handleErrors = function( error )
{
	var section = this.currentSection;
	section.waiting = null;
	if ( error.stack && !error.fromAOZ )
	{
		// Trapped error?
		if ( !section.nextError )
		{
		section.badEnd = true;
		this.errorObject = this.errors.getError( 'internal_error' );
		this.lastError = this.errorObject.number;
		this.lastErrorPos = this.sourcePos;
		section.error = this.errorObject.number;
		console.log( error.message );
		console.log( error.stack );
		this.renderer.captureCrash( error );
		if ( this.aoz.platform == "amiga" )
		{
			this.renderer.meditate();
			this.clickMouse = false;
			this.waiting = this.waitForGuru;
			this.waitThis = this;
		}
		else
		{
			this.utilities.sendCrashMail();
			this.break = true;
		}
			return;
	}
		error = section.nextError;
		section.nextError = null;
	}

	// Trap? No error and branch to the next instruction
	var errorObject = this.errors.getError( error );
	if ( section.trapPosition == section.position )
	{
		this.section = this.currentSection;
		section.trappedErrorNumber = errorObject.number;
		section.trapPosition = -1;
		return;
	}
	else if ( section.onError )
	{
		this.section = this.currentSection;
		section.lastError = errorObject.number;
		if ( typeof section.onError == 'number' )
		{
			section.resume = section.position;
			section.position = section.onError;
			section.isErrorOn = true;
		}
		else
		{
			// Push previous section
			this.sections.push( section );

			// Initialize procedure parameters
			var newSection = new section.onError( this, section, {} );
			newSection = this.initSection( newSection );
			newSection.isErrorProc = true;
		}
		return;
	}

	// Break application
	this.errorObject = this.errors.getError( error );
	this.lastError = this.errorObject.number;
	this.lastErrorPos = this.sourcePos;
	this.badEnd = true;
	this.break = true;
};
AOZ.prototype.printToDirectMode = function( text )
{
	if ( window.parent && window.parent.atom && window.parent.atom.printLine )
	{
		window.parent.atom.printLine( text );
	}
};

AOZ.prototype.callPython = function( functionName, args, callback, extra )
{
	if ( pywebview )
	{
		switch ( args.length )
		{
			case 0:
				pywebview.api[ functionName ]().then( function( result ) 
				{
					if ( callback )
						callback( true, result, extra );
				}, function( error ) 
				{
					if ( callback )
						callback( false, error, extra );
				} );
				return;
			case 1:
				pywebview.api[ functionName ]( args[ 0 ] ).then( function( result ) 
				{
					if ( callback )
						callback( true, result, extra );
				}, function( error ) 
				{
					if ( callback )
						callback( false, error, extra );
				} );
				return;
			case 2:
				pywebview.api[ functionName ]( args[ 0 ], args[ 1 ] ).then( function( result ) 
				{
					if ( callback )
						callback( true, result, extra );
				}, function( error ) 
				{
					if ( callback )
						callback( false, error, extra );
				} );
				return;
			default:
				throw 'internal_error'		
		}
	}
	return false;
};

/////////////////////////////////////////////////////////////////////////
//
// OBJECT ORIENTATION
//
/////////////////////////////////////////////////////////////////////////
AOZ.prototype.getBob = function( index )
{
	return this.currentScreen.getBob( index, 'bob_not_defined' );
};
AOZ.prototype.getSprite = function( index, errorString )
{
	var contextName = typeof contextName == 'undefined' ? this.aoz.currentContextName : contextName;
	return this.aoz.spritesContext.getElement( contextName, index, errorString );
};
AOZ.prototype.addObject = function( thisObject, thatObject )
{
	var className = thatObject.className.toLowerCase();
	if ( !thisObject[ className ] )
		{
		thisObject[ className ] = [];
		thisObject[ className + '_current' ] = null;
	}

	thisObject[ className ].push( thatObject );
	thisObject[ className + '_current' ] = thatObject;
	thatObject.rootObject = thisObject;
	this.addToSynchro( thatObject, thisObject );
};
AOZ.prototype.setObject = function( thisObject, thatObject, index )
{
	var className = thatObject.className.toLowerCase();
	if ( typeof index == 'undefined' )
	{
	thisObject[ className ] = [ thatObject ];
	thisObject[ className + '_current' ] = thatObject;
	}
	else
	{
		if ( !thisObject[ className ] )
			thisObject[ className ] = [];
		if ( index < 0 || index > thisObject[ className ].length + 1 )
			throw 'illegal_function_call';
		thisObject[ className ][ index ] = thatObject;
		thisObject[ className + '_current' ] = thatObject;	
	}
	this.addToSynchro( thatObject, thisObject );
};
AOZ.prototype.delObject = function( thisObject, thatObject, index )
{
	var className = thatObject.className.toLowerCase();
	if ( thisObject[ className ] )
	{
		// Find the good object
		if ( index < 0 )
		{
			thatObject = thisObject[ className + '_current' ];
			index = undefined;
		}
		if ( typeof index == 'undefined' )
		{
			index = thisObject[ className ].findIndex( function( element )
			{
				return element == thatObject;
			} );
		}

		// Delete
		if ( index < 0 || index >= thisObject[ className ].length )
			throw 'illegal_function_call';
		thisObject[ className ].slice( index, 1 );

		// The object at its position becomes the current one
		if ( thisObject[ className ].length > 0 )
		{
			if ( index == thisObject[ className ].length )
				index = thisObject[ className ].length - 1;
			thisObject[ className + '_current' ] = thisObject[ className ][ index ];
		}
		this.removeFromSynchro( thatObject );
	}
};

AOZ.prototype.sendMessage = function( message, options, callback, extra )
{
	// Send message to IDE
	if ( this.connectedToIDE == true )
	{
		this.ideWebSocket.send( JSON.stringify( message ) );

		if ( callback )
		{
			callback( true, {}, {} );
		}
	}
	else
	{
		if ( callback )
		{
			callback( false, "Web socket not opened", {} );
		}
	}
};
AOZ.prototype.waitForFinalLoad = function()
{
	if ( this.loadingCount == this.loadingMax )
	{
		this.waiting = null;
	}
};
AOZ.prototype.waitForGuru = function()
{
	if ( this.clickMouse )
	{
		if ( this.clickMouse & 0x01 )
			this.utilities.sendCrashMail();
		this.waiting = null;
		this.break = true;
	}
};
AOZ.prototype.pushExtension = function( section )
{
	this.extensionsToRun.push( section );
};
AOZ.HREV = 0x8000;
AOZ.VREV = 0x4000;

/////////////////////////////////////////////////////////////////////////
//
// UPDATE PROCESSUS - TODO -> a voir pas clar ici!
//
/////////////////////////////////////////////////////////////////////////
AOZ.prototype.addToSynchro = function( thisObject, rootObject )
{
	if ( thisObject[ 'update_m' ] )
	{
		if ( typeof rootObject != 'undefined' )
			rootObject.synchroOn = true;
		else
			rootObject = thisObject;
		var found = this.synchroList.findIndex( function( element )
		{
			return ( element.thisObject == thisObject && element.thisObject.objectNumber == thisObject.objectNumber );
	} );
	if ( found < 0 )
			this.synchroList.splice( 0, 0, { thisObject: thisObject, rootObject: rootObject } );
		else 
			this.synchroList[ found ].rootObject = rootObject;
	}
};
AOZ.prototype.removeRootObjectFromSynchro = function( rootObject )
{
	var found;
	do
	{
		found = this.synchroList.findIndex( function( element )
	{
			return element.rootObject == rootObject;
	} );
	if ( found >= 0 )
		{
			this.synchroList.splice( found, 1 );
		}
	} while( found >= 0 )
};
AOZ.prototype.removeFromSynchro = function( thatObject )
{
			var found = this.synchroList.findIndex( function( element )
			{
		return element == thatObject && element.objectNumber == thatObject.objectNumber;
			} );
			if ( found >= 0 )
			{
		this.synchroList.splice( found, 1 );
	}	
};
AOZ.prototype.doSynchro = function( deltaTime )
{
	try
	{
		if ( this.amal && this.amal.isSynchro )
			this.amal.doSynchro();
	
		// Every
		if ( this.everyOn )
		{
			for ( var e = 0; e < this.everyPile.length; e++ )
			{
				var info = this.everyPile[ e ];
				info.deltaTime -= deltaTime;
				if ( info.deltaTime < 0 )
				{
					info.deltaTime += info.interval;
					while( info.deltaTime < 0 )
						info.deltaTime += info.interval;
	
					if ( info.definition.type == 'gosub' )
					{
						this.everyOn = false;
						info.section.returns.push( -( info.section.position + 1 ) );
						info.section.position = info.definition.label;
						var saveWaiting = info.section.waiting;
						var saveWaitingThis = info.section.waitThis;
						info.section.waiting = null;
						try
						{
							this.runBlocks( info.section, false );
						}
						catch( error )
						{
							this.handleErrors( error );
						}
						info.section.waiting = saveWaiting;
						info.section.waitThis = saveWaitingThis;
					}
					else
					{
						this.everyOn = false;
						this.sections.push( null );
						var section = new this.root[ 'p_' + info.definition.procedure ]( this, this.section );
						try
						{
							this.runBlocks( section, false );
						}
						catch( error )
						{
							this.handleErrors( error );
						}
					}
				}
			};
		}

		// All objects update
		for ( var o = 0; o < this.synchroList.length; o++ )
		{
			var thisObject = this.synchroList[ o ].thisObject;
			var method = thisObject[ 'update_m' ];
			if ( method )
			{
				var rootObject = this.synchroList[ o ].rootObject;
				if ( rootObject.synchroOn )
			{

				this.sections.push( null );
					method.vars.channel = rootObject;
					method.vars.deltaTime = deltaTime;
					method.position = 0;
					rootObject.synchroOn = false;
				try
				{
						this.runBlocks( method, false );
				}
				catch( error )
				{
					this.handleErrors( error );
				}
					rootObject.synchroOn = true;

					if ( method.parent.className == 'Movement' )
						this.aoz.callAnimations( rootObject, deltaTime );
				}
			}
		}
	}
	catch ( error )
	{
		this.handleErrors( error );
	}
};


AOZ.prototype.setUpdate = function( onOff )
{
	this.isUpdate = onOff;
};
AOZ.prototype.setBobsUpdate = function( onOff )
{
	if ( this.isUpdate != onOff )
	{
		this.isUpdate = onOff;
		for ( var screen = this.screensContext.getFirstElement(); screen != null; screen = this.screensContext.getNextElement() )
			screen.setBobsUpdate( onOff );
	}
}
AOZ.prototype.rendererUpdate = function()
{
	this.updateEveryCount++;
	if ( this.updateEveryCount > this.updateEvery )
	{
		this.updateEveryCount = 0;
		this.update();
	}
}
AOZ.prototype.update = function( force )
{
	if ( !force )
		force = this.isUpdate;
	//else ???
	//	force = !this.isUpdate;
	if ( force )
	{
		if ( this.sprites )
			this.sprites.update( force );
		for ( var screen = this.screensContext.getFirstElement(); screen != null; screen = this.screensContext.getNextElement() )
			screen.bobsUpdate( force );
	}
};
AOZ.prototype.bobsUpdate = function( force )
{
	if ( !force )
		force = this.isUpdate;
	//else
	//	force = !this.isUpdate;
	if ( force )
	{
		for ( var screen = this.screensContext.getFirstElement(); screen != null; screen = this.screensContext.getNextElement() )
			screen.bobsUpdate( force );
	}
};
AOZ.prototype.updateEvery = function( every )
{
	if ( every < 1 )
		throw 'illegal_function_call';
	this.updateEvery = every;
	this.updateEveryCount = 0;
};



AOZ.prototype.free = function()
{
	return 0;
};
AOZ.prototype.fastFree = function()
{
	return 0;
};
AOZ.prototype.chipFree = function()
{
	return 0;
};


AOZ.prototype.setTags = function( tags )
{
	if ( this.utilities.getTag( tags, [ 'refresh' ] ) != '' )
		this.renderer.setModified();
	if ( this.utilities.getTag( tags, [ 'restart' ] ) != '' )
		this.run();
	if ( this.utilities.getTag( tags, [ 'debugger' ] ) != '' )
		debugger;
	if ( this.utilities.getTag( tags, [ 'break' ] ) != '' )
		this.break;
	/*
	Possible tags:
	#step-> go in step-through mode after property has been set in AOZ debugger (do today?)
	#record -> record all the values of the property with time
	*/
};

AOZ.prototype.displayWidth = function()
{
	var result;
	if ( this.platform == 'amiga' )
	{
		result = 342;
	}
	else
	{
		result = this.renderer.width;
	}
	return result;
};
AOZ.prototype.displayHeight = function()
{
	var result;
	if ( this.platform == 'amiga' )
	{
		result = this.manifest.display.tvStandard == 'ntsc' ? 261 : 311;
	}
	else
	{
		result = this.renderer.height;
	}
	return result;
};
AOZ.prototype.ntsc = function()
{
	return this.platform == 'amiga' && this.manifest.display.tvStandard == 'ntsc';
};
AOZ.prototype.allowRefresh = function()
{
	this.refreshCounter++;
	if ( this.refreshCounter > self.refreshTrigger )
	{
		this.refreshCounter = 0;
		this.loopCounter = 0;
	}
};
AOZ.prototype.stop = function()
{
	debugger;
	//throw 'program_interrupted';
};
AOZ.prototype.every = function( interval, definition )
{
	if ( this.everyPile.find( function( element )
	{
		return definition = element.definition;
	} ) )
		throw 'every_already_defined';

	// Only one Gosub
	if ( definition.type == 'gosub' )
	{
		if ( this.everyPile.find( function( element )
		{
			return element.definition.type == 'gosub';
		} ) )	
		throw 'every_already_defined';
	}
	if ( interval <= 0 )
		throw 'illegal_function_call';
	if ( this.manifest.compilation.platform != 'aoz' && this.manifest.compilation.platform != 'pc' )
		interval *= 20;

	var info = 
	{
		definition: definition,
		section: this.currentSection, 
		deltaTime: 0,
		interval: interval
	};
	this.everyPile.push( info );
	this.everyOn = true;
};
AOZ.prototype.everyOnOff = function( onOff )
{
	if ( !onOff )
		this.everyPile = [];
	else
		this.everyOn = true;
};

/////////////////////////////////////////////////////////////////////////
//
// SCREENS
//
/////////////////////////////////////////////////////////////////////////
AOZ.prototype.screenOpenTemporary = function( rootNumber, width, height, numberOfColors, pixelMode, palette )
{
	var currentScreen = this.currentScreen.index;

	// Get a free screen number
	while( this.screensContext.getElement( this.currentContextName, rootNumber, undefined ) )
		rootNumber++;

	// Open and hide the cursor
	this.screenOpen( rootNumber, width, height, numberOfColors, palette );
	this.currentScreen.currentTextWindow.setCursor( false );
	this.currentScreen.show( false );
	var result = this.currentScreen;
	this.aoz.setScreen( currentScreen );

	// Return the number of the screen.
	return result;
}
AOZ.prototype.screenOpen = function( number, width, height, numberOfColors, pixelMode, palette )
{
	var screenDefinition = this.manifest.default.screen;
	if ( number < 0 )
		throw 'illegal_function_call';

	width = typeof width != 'undefined' ? width : screenDefinition.width;
	height = typeof height != 'undefined' ? height : screenDefinition.height;
	numberOfColors = typeof numberOfColors != 'undefined' ? numberOfColors : screenDefinition.numberOfColors;
	pixelMode = typeof pixelMode != 'undefined' ? pixelMode : screenDefinition.pixelMode;
	palette = typeof palette != 'undefined' ? palette : this.utilities.copyArray( this.defaultPalette );

/**
	if ( !this.unlimitedScreens && number > 8 )
		throw 'illegal_function_call';
*/

	screenDefinition.width = width;
	screenDefinition.height = height;
	screenDefinition.numberOfColors = numberOfColors;
	screenDefinition.pixelMode = pixelMode;
	screenDefinition.palette = palette;

	// Close screen if same number?
	var previousScreen = this.screensContext.getElement( this.currentContextName, number );
	if ( previousScreen )
		this.screenClose( number );
	else if ( this.currentScreen && this.currentScreen.number >= 0  )
		this.currentScreen.deactivate();
	this.currentScreen = new Screen( this, this.renderer, this.currentContextName, screenDefinition );
	this.currentScreen.number = number;
	this.screensContext.setElement( this.currentContextName, this.currentScreen, number, true );
	this.renderer.setModified();
	return this.currentScreen;
};
AOZ.prototype.screenClose = function( number )
{
	var screen = this.getScreen( number );

	// Close cloned screens
	var self = this;
	do
	{
		var redo = false;
		for ( var s = this.screensContext.getFirstElement( this.currentContextName ); s != null; s = this.screensContext.getNextElement( this.currentContextName ) )
		{
			if ( s.cloned == screen )
			{
				closeIt( s );
				redo = true;
				break;
			}
		}
	} while( redo );

	// Close screen
	closeIt( screen );
	this.renderer.setModified();

	function closeIt( screen )
	{
		screen.deactivate();
		self.screensContext.deleteElement( self.currentContextName, screen );
		self.currentScreen = self.screensContext.getLastElement( self.currentContextName );
		if ( !self.currentScreen )
		{
			self.currentScreen = new Screen.ScreenEmpty( self );
			self.currentScreen.number = -1;
		}
	}
};
AOZ.prototype.screenClone = function( number )
{
	//var screen = this.getScreen( number );
	var oldScreen = this.currentScreen;
	var screen = this.screenOpen( number, this.currentScreen.width, this.currentScreen.height, this.currentScreen.numberOfColors, this.currentScreen.pixelMode, this.currentScreen.palette );
	screen.setCloned( oldScreen );
	this.setScreen( oldScreen.number );
	this.renderer.setModified();
};
AOZ.prototype.setScreen = function( number )
{
	var screen = this.getScreen( number );
	if ( this.currentScreen )
		this.currentScreen.deactivate();
	this.currentScreen = screen;
	this.currentScreen.activate();
};
AOZ.prototype.getScreen = function( number )
{
	if ( typeof number == 'undefined' )
		return this.currentScreen;
	return this.screensContext.getElement( this.currentContextName, number, 'screen_not_opened' );
};
AOZ.prototype.getScreenOrCreateOne = function( number, width, height, numberOfColors, pixelMode )
{
	if ( typeof number == 'undefined' )
	{
		if ( this.currentScreen.emptyScreen )
			throw 'screen_not_opened'
		return this.currentScreen;
	}

	var screen = this.screensContext.getElement( this.currentContextName, number );
	if ( screen )
		return screen;

	// Create screen, and cursoff!
	this.screenOpen( number, width, height, numberOfColors, pixelMode );
	this.currentScreen.currentTextWindow.setCursor( false );
	return this.currentScreen;
};
AOZ.prototype.screenIn = function( number, position )
{
	if ( typeof number != 'undefined' )
	{
		return this.getScreen( number ).isIn( position ) ? number : -1;
	}
	for ( var screen = this.screensContext.getLastElement( this.currentContextName ); screen != null; screen = this.screensContext.getPreviousElement( this.currentContextName ) )
	{
		if ( screen.isIn( position ) )
		{
			return screen.number;
		}
	}
	return -1;
};
AOZ.prototype.mouseScreen = function( position )
{
	for ( var screen = this.screensContext.getLastElement( this.currentContextName ); screen !=null; screen = this.screensContext.getPreviousElement( this.currentContextName ) )
	{
		if ( screen.isIn( position ) )
		{
			return screen.number;
		}
	}
	return -1;
};

AOZ.prototype.screenToBack = function( number )
{
	var screen = this.getScreen( number );
	for ( var s = 0; s < this.screensZ.length; s++ )
	{
		if ( this.screensZ[ s ] == screen )
			break;
	}
	this.screensZ.splice( s, 1 );
	this.screensZ.splice( 0, 0, screen );
	this.renderer.setModified();
};
AOZ.prototype.screenSkew = function( number, xSkew, ySkew )
{
	var screen = this.getScreen( number );
	screen.xSkewDisplay = typeof xSkew != 'undefined' ? xSkew : screen.xSkewDisplay;
	screen.ySkewDisplay = typeof ySkew != 'undefined' ? ySkew : screen.ySkewDisplay;
	screen.setModified();
};
AOZ.prototype.screenScale = function( number, xScale, yScale )
{
	var screen = this.getScreen( number );
	screen.xScaleDisplay = typeof xScale != 'undefined' ? xScale : screen.xScaleDisplay;
	screen.yScaleDisplay = typeof yScale != 'undefined' ? yScale : screen.yScaleDisplay;
	screen.setModified();
};

AOZ.prototype.dualPlayfield = function( screen1, screen2 )
{
	screen1 = this.getScreen( screen1 );
	screen2 = this.getScreen( screen2 );
	screen1.setDualPlayfield( screen2 );
};
AOZ.prototype.dualPriority = function( screen1, screen2 )
{
	screen1 = this.getScreen( screen1 );
	screen2 = this.getScreen( screen2 );
	screen1.dualPriority( screen2 );
};
AOZ.prototype.setDefaultPalette = function( palette )
{
	for ( var p = 0; p < palette.length; p++ )
	{
		if ( typeof palette[ p ] != 'undefined' )
		{
			this.defaultPalette[ p ] = this.utilities.getModernColorString( palette[ p ] );
		}
	}
};
AOZ.prototype.colourBack = function( color, isIndex )
{
	if ( !isIndex )
		color = this.utilities.getModernColorString( color );
	else
	{
		if ( color < 0 )
			throw 'illegal_function_call';
		color %= this.currentScreen.numberOfColors;
		color = this.currentScreen.palette[ color ];
	}
	this.renderer.setBackgroundColor( color );
};
AOZ.prototype.swapZScreenPosition = function( screen1, screen2 )
{
	var z1, z2;
	for ( z1 = 0; z1 < this.screensZ.length; z1++ )
	{
		if ( this.screensZ[ z1 ] == screen1 )
			break;
	}
	for ( z2 = 0; z2 < this.screensZ.length; z2++ )
	{
		if ( this.screensZ[ z2 ] == screen2 )
			break;
	}
	var temp = this.screensZ[ z1 ];
	this.screensZ[ z1 ] = this.screensZ[ z2 ];
	this.screensZ[ z2 ] = temp;
};
AOZ.prototype.setBelowZScreenPosition = function( screen1, screen2 )
{
	var z1, z2;
	for ( z1 = 0; z1 < this.screensZ.length; z1++ )
	{
		if ( this.screensZ[ z1 ].number == screen1.number )
			break;
	}
	for ( z2 = 0; z2 < this.screensZ.length; z2++ )
	{
		if ( this.screensZ[ z2 ].number == screen2.number )
			break;
	}
	if ( z1 > z2 )
	{
		this.screensZ.splice( z1, 1 );
		this.screensZ.splice( z2, 0, screen1 );
	}
}
AOZ.prototype.default = function( contextName )
{
	this.screenOpen( 0 );
};

AOZ.prototype.lprint = function()
{
	throw 'instruction_not_implemented';
};











AOZ.prototype.doError = function( number )
{
	throw this.errors.getErrorFromNumber( number ).index;
};

AOZ.prototype.asc = function( text )
{
	if ( text != '' )
		return text.charCodeAt( 0 );
	return 0;
};
AOZ.prototype.repeat$ = function( text, number )
{
	if ( number < 0 )
		throw( 'illegal_text_window_parameter' );
	var result = '';
	for ( var n = 0; n < number; n++ )
		result += text;
	return result;
};
AOZ.prototype.str$ = function( value )
{
	if ( value === false )
		value = 0;
	if ( this.platform != 'aoz' )
	{
		if ( value === true )
			value = -1;
	}
	else
	{
		if ( value === true )
			value = 1;
	}
	var space = value >= 0 ? ' ' : '';

	var result;
	if ( this.fix == 16 )
		result = '' + value;
	else if ( this.fix >= 0 )
		result = value.toFixed( this.fix );
	else
		result = value.toExponential( -this.fix );

	// Fix -0.00 problem...
	if ( result.substring( 0, 3 ) == '-0.' )
	{
		var onlyZeros = true;
		for ( var p = 0; p < result.length; p++ )
		{
			var c = result.charAt( p );
			if ( c >= '1' && c <= '9' )
			{
				onlyZeros = false;
				break;
			}
		}
		if ( onlyZeros )
			result = result.substring( 1 );
	}
	return space + result;
};

AOZ.prototype.val = function( value )
{
	var base = 10;
	var result = 0;
	var s = value.substring(0,1);
	switch (s)
	{
		case '$':
			value = value.substring( 1 );
			base = 16;
			result = parseInt( value, base );
			break;
		case '%':
			value = value.substring( 1 );
			base = 2;
			result = parseInt( value, base );
			break;
		default:
			result = parseFloat( value );
	}
	if ( isNaN( result ) )
		result = 0;
	return result;
};
/*
	Note:  Minor issue remains on val.
	In AMOS Pro, if the variable being set is an Integer, the integer value should
	be taken before conversion, so no rounding occurs.  So...
		X = Val("1234.56") would return X as 1234 vs. 1235.
*/

AOZ.prototype.space$ = function( value )
{
	if ( value < 0 )
		throw( 'illegal_function_call' );

	var result = '';
	for ( var s = 0; s < value; s++ )
		result += ' ';
	return result;
}
AOZ.prototype.toRadian = function( value )
{
	if ( this.degrees )
	 	return value / 180 * ( Math.PI / 2 );
	return value;
};
AOZ.prototype.toDegree = function( value )
{
	if ( this.degrees )
	 	return value * 180 / ( Math.PI / 2 );
	return value;
};

// Keyboard / mouse
AOZ.keyModifiers =
{
	amiga:
	{
		'LEFTSHIFT': 0x0001,
		'RIGHTSHIFT': 0x0002,
		'LEFTCONTROL': 0x8008, // BJF was 4
		'RIGHTCONTROL': 0x0008,
		'CONTROL': 0x8008, // BJF control C fix.
		'LEFTALT': 0x0010,
		'RIGHTALT': 0x0020,
		'LEFTMETA': 0x0040,
		'RIGHTMETA': 0x0080,
		'CAPSLOCK': 0x0004,
		'NUMLOCK': 0x0200,
		'SCROLLLOCK': 0x0400,
		'FUNCLOCK': 0x0800 // BJF added
		// do we also need INSERTLOCK?
	},
	aoz:
	{
		'LEFTSHIFT': 0x0001,
		'RIGHTSHIFT': 0x0002,
		'LEFTCONTROL': 0x0004,
		'RIGHTCONTROL': 0x0008,
		'CONTROL': 0x000C, // BJF control C fix
		'LEFTALT': 0x0010,
		'RIGHTALT': 0x0020,
		'LEFTMETA': 0x0040,
		'RIGHTMETA': 0x0080,
		'CAPSLOCK': 0x0100,
		'NUMLOCK': 0x0200, //
		'SCROLLLOCK': 0x0400,
		'FUNCLOCK': 0x0800 // BJF added
	}
}

AOZ.keyPressed =
{
	// AOZ
	aoz:
	{
		'Minus':		{ inkey$: '-', keyCode: 189 },
		'Equal': 		{ inkey$: '=', keyCode: 187 },

		'Insert': 		{ inkey$: '', keyCode: 45 },
		'Delete': 		{ inkey$: '', keyCode: 46 },
		'Home': 		{ inkey$: '', keyCode: 36 },
		'End': 			{ inkey$: '', keyCode: 35 },
		'PageUp': 		{ inkey$: '', keyCode: 33 },	
		'PageDown': 	{ inkey$: '', keyCode: 34 },

		'ArrowLeft': { inkey$: String.fromCharCode( 29 ), keyCode: 37 },
		'ArrowRight': { inkey$: String.fromCharCode( 28 ), keyCode: 39 },
		'ArrowUp': { inkey$: String.fromCharCode( 30 ), keyCode: 38 },
		'ArrowDown': { inkey$: String.fromCharCode( 31 ), keyCode: 40 },

		'Enter': { inkey$: String.fromCharCode( 13 ), keyCode: 13 },

		'Backspace': { inkey$: String.fromCharCode( 8 ), keyCode: 8 },
		'Backquote': { inkey$: '`', keyCode: 192 },
		'Backslash': { inkey$: '\\', keyCode: 220 },

		'Del': 			{ inkey$: '', keyCode: 'event.which' }, 
		'End': 			{ inkey$: '', keyCode: 35 },
		'Home': 		{ inkey$: '', keyCode: 36 },

		'ScrollLock': 	{	inkey$: '', keyCode: 145 },
		'Pause': 		{ inkey$: '', keyCode: 19 },
		'NumLock': 		{ inkey$: '', keyCode: 144 }, 
		'CapsLock': 	{ inkey$: '', keyCode: 20 }, 

		'Tab': { inkey$: String.fromCharCode( 9 ), keyCode: 9 },

		'Comma': { inkey$: ',', keyCode: 188 },
		'Period': { inkey$: '.', keyCode: 190 },
		'Slash': { inkey$: '/', keyCode: 191 },
		'Quote': { inkey$: '"', keyCode: 222 },
		'Semicolon': { inkey$: ';', keyCode: 186 },
		'BracketLeft': 	{ inkey$: '[', keyCode: 219 }, 
		'BracketRight': { inkey$: ']', keyCode: 221 }, 
		'Escape': { inkey$: String.fromCharCode( 0 ), keyCode: 27 },

		// modifier keys
		'Shift': { inkey$: '', keyCode: 16 },
		'Control': { inkey$: '', keyCode: 17 },
		'ShiftLeft': 	{ inkey$: '', keyCode: 16 }, 
		'ShiftRight': 	{ inkey$: '', keyCode: 16 }, 
		'ControlLeft': { inkey$: '', keyCode: 17 },
		'ControlRight': { inkey$: '', keyCode: 17 },
		'AltLeft':		{ inkey$: '', keyCode: 18 },
		'AltRight':		{ inkey$: '', keyCode: 18 },
		'OSLeft': 		{ inkey$: '', keyCode: 91 }, 
		'MetaLeft': { inkey$: '', keyCode: 91 },
		'ContextMenu': 	{ inkey$: '', keyCode: 92 }, 

		'IntlBackslash': { inkey$: '<', keyCode: 'event.which' },

		'F1': 			{ inkey$: '', keyCode: 112 },
		'F2': 			{ inkey$: '', keyCode: 113 },
		'F3': 			{ inkey$: '', keyCode: 114 },
		'F4': 			{ inkey$: '', keyCode: 115 },
		'F5': 			{ inkey$: '', keyCode: 116 },
		'F6': 			{ inkey$: '', keyCode: 117 },
		'F7': 			{ inkey$: '', keyCode: 118 },
		'F8': 			{ inkey$: '', keyCode: 119 },
		'F9': 			{ inkey$: '', keyCode: 120 },
		'F10': 			{ inkey$: '', keyCode: 121 },

		// F11 & F12 are used by macOS
		'F11': 			{ inkey$: '', keyCode: 122 },
		'F12': 			{ inkey$: '', keyCode: 123 },
		'F13': 			{ inkey$: '', keyCode: 124 },

		'Numpad0': { inkey$: '0', keyCode: 96 },
		'Numpad1': { inkey$: '1', keyCode: 97 },
		'Numpad2': { inkey$: '2', keyCode: 98 },
		'Numpad3': { inkey$: '3', keyCode: 99 },
		'Numpad4': { inkey$: '4', keyCode: 100 },
		'Numpad5': { inkey$: '5', keyCode: 101 },
		'Numpad6': { inkey$: '6', keyCode: 102 },
		'Numpad7': { inkey$: '7', keyCode: 103 },
		'Numpad8': { inkey$: '8', keyCode: 104 },
		'Numpad9': { inkey$: '9', keyCode: 105 },

		'NumpadDivide': { inkey$: '/', keyCode: 111 },
		'NumpadMultiply': { inkey$: '*', keyCode: 106 },
		'NumpadSubtract': { inkey$: '-', keyCode: 109 },
		'NumpadAdd': { inkey$: '+', keyCode: 107 },
		'NumpadEnter': { inkey$: String.fromCharCode( 13 ), keyCode: 13 },
		'NumpadDecimal': { inkey$: '.', keyCode: 110 },
		'NumpadEqual': 	{ inkey$:'=', keyCode: 187 },

		'Digit0': { inkey$: 'event.key', keyCode: 48 },
		'Digit1': { inkey$: 'event.key', keyCode: 49 },
		'Digit2': { inkey$: 'event.key', keyCode: 50 },
		'Digit3': { inkey$: 'event.key', keyCode: 51 },
		'Digit4': { inkey$: 'event.key', keyCode: 52 },
		'Digit5': { inkey$: 'event.key', keyCode: 53 },
		'Digit6': { inkey$: 'event.key', keyCode: 54 },
		'Digit7': { inkey$: 'event.key', keyCode: 55 },
		'Digit8': { inkey$: 'event.key', keyCode: 56 },
		'Digit9': { inkey$: 'event.key', keyCode: 57 },
		'Space': { inkey$: 'event.key', keyCode: 32 },
		'KeyA': { inkey$: 'event.key', keyCode: 65 },
		'KeyB': { inkey$: 'event.key', keyCode: 66 },
		'KeyC': { inkey$: 'event.key', keyCode: 67 },
		'KeyD': { inkey$: 'event.key', keyCode: 68 },
		'KeyE': { inkey$: 'event.key', keyCode: 69 },
		'KeyF': { inkey$: 'event.key', keyCode: 70 },
		'KeyG': { inkey$: 'event.key', keyCode: 71 },
		'KeyH': { inkey$: 'event.key', keyCode: 72 },
		'KeyI': { inkey$: 'event.key', keyCode: 73 },
		'KeyJ': { inkey$: 'event.key', keyCode: 74 },
		'KeyK': { inkey$: 'event.key', keyCode: 75 },
		'KeyL': { inkey$: 'event.key', keyCode: 76 },
		'KeyM': { inkey$: 'event.key', keyCode: 77 },
		'KeyN': { inkey$: 'event.key', keyCode: 78 },
		'KeyO': { inkey$: 'event.key', keyCode: 79 },
		'KeyP': { inkey$: 'event.key', keyCode: 80 },
		'KeyQ': { inkey$: 'event.key', keyCode: 81 },
		'KeyR': { inkey$: 'event.key', keyCode: 82 },
		'KeyS': { inkey$: 'event.key', keyCode: 83 },
		'KeyT': { inkey$: 'event.key', keyCode: 84 },
		'KeyU': { inkey$: 'event.key', keyCode: 85 },
		'KeyV': { inkey$: 'event.key', keyCode: 86 },
		'KeyW': { inkey$: 'event.key', keyCode: 87 },
		'KeyX': { inkey$: 'event.key', keyCode: 88 },
		'KeyY': { inkey$: 'event.key', keyCode: 89 },
		'KeyZ': { inkey$: 'event.key', keyCode: 90 },
	}, // aoz

	// Javascript -> Amiga
	amiga:
	{
		'Minus':	{ inkey$: '-',keyCode: 0x0B},
		'Equal': 	{ inkey$: '=', keyCode: 0x0C },

		'Insert': 		{ inkey$: '', keyCode: 45 },
		'Delete': 		{ inkey$: '', keyCode: 46 },
		'Home': 		{ inkey$: '', keyCode: 36 },
		'End': 			{ inkey$: '', keyCode: 35 },
		'PageUp':		{ inkey$: '', keyCode: 33 },
		'PageDown': { inkey$: '', keyCode: 34 },

		'ArrowLeft': { inkey$: String.fromCharCode( 29 ), keyCode: 79 },
		'ArrowRight': { inkey$: String.fromCharCode( 28 ), keyCode: 78 },
		'ArrowUp': { inkey$: String.fromCharCode( 30 ), keyCode: 76 },
		'ArrowDown': { inkey$: String.fromCharCode( 31 ), keyCode: 77 },

		'Enter': { inkey$: String.fromCharCode( 13 ), keyCode: 0x44 }, // 69 },
		'Backspace': { inkey$: String.fromCharCode( 8 ), keyCode: 65 },
		'Backquote': { inkey$: '``', keyCode: 192 },
		'Backslash': { inkey$: '\\', keyCode: 13 },

		'Del': { inkey$: String.fromCharCode( 0 ), keyCode: 70 },

		'Tab': { inkey$: '\t', keyCode: 66 },
		'Comma': { inkey$: ',', keyCode: 56 },
		'Period': { inkey$: '.', keyCode: 57 },
		'Slash': { inkey$: '/', keyCode: 58 },
		'Quote': { inkey$: '"', keyCode: 42 },
		'Semicolon': { inkey$: ';', keyCode: 41 },
		'BracketLeft': { inkey$: '[', keyCode: 26 },
		'BracketRight': { inkey$: ']', keyCode: 27 },
		'Escape': { inkey$: String.fromCharCode( 27 ), keyCode: 69 },

		// locking keys
		'CapsLock': 	{ inkey$: '', keyCode: 0x62 },
		'ScrollLock': { inkey$: undefined, keyCode: undefined },
		'NumLock': 		{ inkey$: '', keyCode: 12+128 },

		// modifier keys
		'Shift': 		{ inkey$: '', keyCode: undefined },
		'Control': 		{ inkey$: '', keyCode: undefined },

		'ShiftLeft': 	{ inkey$: '', keyCode: 0x60 }, 
		'ShiftRight': 	{ inkey$: '', keyCode: 0x61 }, 
		'ControlLeft': 	{ inkey$: '', keyCode: 0x63 }, 
		'ControlRight': { inkey$: '', keyCode: 0x63 }, 
		'AltLeft':		{ inkey$: '', keyCode: 0x64 }, 
		'AltRight':		{ inkey$: '', keyCode: 0x65 }, 
		'OSLeft': 		{ inkey$: '', keyCode: 0x66 },
		'MetaLeft': 	{ inkey$: '', keyCode: 0x66 },
		'ContextMenu': 	{ inkey$: '', keyCode: 0x67 },

		'IntlBackslash': { inkey$: '<', keyCode: 'event.which' },

		'F1': { inkey$: '', keyCode: 80 },
		'F2': { inkey$: '', keyCode: 81 },
		'F3': { inkey$: '', keyCode: 82 },
		'F4': { inkey$: '', keyCode: 83 },
		'F5': { inkey$: '', keyCode: 84 },
		'F6': { inkey$: '', keyCode: 85 },
		'F7': { inkey$: '', keyCode: 86 },
		'F8': { inkey$: '', keyCode: 87 },
		'F9': { inkey$: '', keyCode: 88 },
		'F10': { inkey$: '', keyCode: 89 },
		'F11': 			{ inkey$:'', keyCode: 122 },
		'F12': 			{ inkey$: '', keyCode: 123 },
		'F13': 			{ inkey$: '', keyCode: 124 },
		'Numpad0': 		{ inkey$: '0', keyCode: 15 }, 
		'Numpad1': { inkey$: '1', keyCode: 29 },
		'Numpad2': { inkey$: '2', keyCode: 30 },
		'Numpad3': { inkey$: '3', keyCode: 31 },
		'Numpad4': { inkey$: '4', keyCode: 45 },
		'Numpad5': { inkey$: '5', keyCode: 46 },
		'Numpad6': { inkey$: '6', keyCode: 47 },
		'Numpad7': { inkey$: '7', keyCode: 61 },
		'Numpad8': { inkey$: '8', keyCode: 62 },
		'Numpad9': { inkey$: '9', keyCode: 63 },
		'NumpadDivide': { inkey$: '/', keyCode: 92 },
		'NumpadMultiply': { inkey$: '*', keyCode: 93 },
		'NumpadSubtract': { inkey$: '-', keyCode: 74 },
		'NumpadAdd': { inkey$: '+', keyCode: 94 },
		'NumpadEnter': { inkey$: String.fromCharCode( 13 ), keyCode: 67 },
		'NumpadDecimal': { inkey$: '.', keyCode: 60 },
		'NumpadEqual': { inkey$:'=', keyCode: 187 }, // = non-existent on Amiga

		'Digit0': { inkey$: 'event.key', keyCode: 10 },
		'Digit1': { inkey$: 'event.key', keyCode: 1 },
		'Digit2': { inkey$: 'event.key', keyCode: 2 },
		'Digit3': { inkey$: 'event.key', keyCode: 3 },
		'Digit4': { inkey$: 'event.key', keyCode: 4 },
		'Digit5': { inkey$: 'event.key', keyCode: 5 },
		'Digit6': { inkey$: 'event.key', keyCode: 6 },
		'Digit7': { inkey$: 'event.key', keyCode: 7 },
		'Digit8': { inkey$: 'event.key', keyCode: 8 },
		'Digit9': { inkey$: 'event.key', keyCode: 9 },

		'Space': { inkey$: 'event.key', keyCode: 64 },

		'KeyA': { inkey$: 'event.key', keyCode: 32 },
		'KeyB': { inkey$: 'event.key', keyCode: 53 },
		'KeyC': { inkey$: 'event.key', keyCode: 51 },
		'KeyD': { inkey$: 'event.key', keyCode: 34 },
		'KeyE': { inkey$: 'event.key', keyCode: 18 },
		'KeyF': { inkey$: 'event.key', keyCode: 35 },
		'KeyG': { inkey$: 'event.key', keyCode: 36 },
		'KeyH': { inkey$: 'event.key', keyCode: 37 },
		'KeyI': { inkey$: 'event.key', keyCode: 23 },
		'KeyJ': { inkey$: 'event.key', keyCode: 38 },
		'KeyK': { inkey$: 'event.key', keyCode: 39 },
		'KeyL': { inkey$: 'event.key', keyCode: 40 },
		'KeyM': { inkey$: 'event.key', keyCode: 55 },
		'KeyN': { inkey$: 'event.key', keyCode: 54 },
		'KeyO': { inkey$: 'event.key', keyCode: 24 },
		'KeyP': { inkey$: 'event.key', keyCode: 25 },
		'KeyQ': { inkey$: 'event.key', keyCode: 16 },
		'KeyR': { inkey$: 'event.key', keyCode: 19 },
		'KeyS': { inkey$: 'event.key', keyCode: 33 },
		'KeyT': { inkey$: 'event.key', keyCode: 20 },
		'KeyU': { inkey$: 'event.key', keyCode: 22 },
		'KeyV': { inkey$: 'event.key', keyCode: 52 },
		'KeyW': { inkey$: 'event.key', keyCode: 17 },
		'KeyX': { inkey$: 'event.key', keyCode: 50 },
		'KeyY': { inkey$: 'event.key', keyCode: 21 },
		'KeyZ': { inkey$: 'event.key', keyCode: 49 },
	} // amiga
}; // AOZ.keyPressed

AOZ.prototype.setKeyboard = function()
{
	this.keymap = {};
	this.lastKey = ''; // undefined;	// string
	this.lastKeyCode = 0; // undefined;	// numeric
	this.lastKeyName = ''; // undefined;	// string
	this.key = ''; // undefined;
	this.keyCode = 0; // undefined;
	this.keyName = ''; // undefined; BJF 19 Aug fixed undefined
	this.modifiers = 0;
	this.lastModifiers = 0;

	var self = this;
	document.onkeydown = onKeyDown;
	document.onkeyup = onKeyUp;

	function onKeyDown( event )
	{
		if ( !self.developerMode )
		{
			if( event && event.target && event.target.getAttribute( 'keys-binding' ) != 'yes' )
			{
				event.preventDefault();
			}
		}

		// If called under Python, "code" is not defined. Find it from keyCode.
		if ( typeof event.code == 'undefined' )
		{
			if ( AOZ.keyPressed[ self.platformKeymap ] )
			{
				var keys = AOZ.keyPressed[ self.platformKeymap ];
				for ( var k in keys )
				{
					if ( keys[ k ].keyCode == event.keyCode )
					{
						event.code = k;
						break;
					}
				}
			}
		}

		if( window.application.aoz.break )
		{
			if( event.key == 'Escape' )
			{
				if( window.parent && window.parent.atom && window.parent.atom.openDirectMode )
				{
					if( window.parent.AOZViewer )
					{
						if( window.parent.AOZViewer.monitor.style.display == 'block' )
						{
							window.parent.atom.closeAOZViewer();
							return;
						}
					}
					window.parent.atom.openDirectMode();
					return;
				}
			}

			if( event.key == 'Enter' )
			{
				if( window.parent && window.parent.atom && window.parent.atom.closeAOZViewer )
				{
					window.parent.atom.closeAOZViewer();
					return;
				}
			}
			
			if( event.key == 'F2' )
			{
				window.location.reload(false); 
				return;
			}
			
		}

		// Javascript name of the key
		self.keyName = event.code;  // code is *mostly* unique.

		// Javascript event keys
		var info = self.convertToPlatform( self.platformKeymap, event );

		if ( info )
		{
			self.key = event.key;
			self.keyCode = info.keyCode;
			self.keymap[ info.keyCode ] = true;

			// Modifiers
			self.modifiers = getModifiers( self.platformKeymap, event ); // Verify this.  Probable culprit.
			this.keyShift = getModifiers( self.platformKeymap, event ); // BJF 20 August

			// Function keys which = 112 - 121 = F1 - F10
			// If pressed function key, send associated stored contents.  BJF
			if ( event.keyCode >= 112 && event.keyCode < 122 )
			{
				var number = event.keyCode - 112; // 0-9 = F1-F10
				if ( ( self.modifiers && AOZ.SHIFT ) != 0 ) // wrong spelling modifier vs modifiers - wrong & vs &&
					number += 10;   // 10-19 = Shift F1 to Shift F10
				if ( self.key$[ number + 1 ] && self.key$[ number + 1 ] != '' )
				{
					self.startKeyboardInput( self.key$[ number + 1 ] );
				}
			}

			// Control-C
			AOZ.CONTROL = 0x000C; // for aoz (either control)
			// 0x8008 for Amiga (either control`)
			// 0x0200 = NUMLOCK - if numlock ON fails
			if ( (event.keyCode == 67) && ((self.modifiers & AOZ.CONTROL ) == 4) && self.breakOn == true )
			{
				self.break = true;
				self.badEnd = true;
			}
		}
	}; // onKeyDown(event)

	function onKeyUp( event )
	{
		if ( event.defaultPrevented || event.repeat )
		{
			return;
		}

		// Keymap UP!
		var info = self.convertToPlatform( self.platformKeymap, event );
		if ( info )
			self.keymap[ info.keyCode ] = false;

		// Modifiers
		self.modifiers = getModifiers( self.platformKeymap, event ); // BJF disabled 19 August
		self.modifiers = clearModifiers( self.platformKeymap, event ); // BJF added 19 Aug
	} // onKeyUp(event)

	function clearModifiers( platform, event )
	{
//		this.modifiers &= event.which==16 && event.location==1 ? getFlag('LEFTSHIFT');
		if (event.which==16 && event.location==1) this.modifiers &= getFlag('LEFTSHIFT' ^ 0xFFFFFFFF);
		if (event.which==16 && event.location==2) this.modifiers &= getFlag('RIGHTSHIFT' ^ 0xFFFFFFFF);
		if (event.which==17 && event.location==1) this.modifiers &= getFlag('LEFTCONTROL' ^ 0xFFFFFFFF);
		if (event.which==17 && event.location==2) this.modifiers &= getFlag('RIGHTCONTROL' ^ 0xFFFFFFFF);
		if (event.which==91) this.modifiers &= getFlag('LEFTMETA' ^ 0xFFFFFFFF);
		if (event.which==93) this.modifiers &= getFlag('RIGHTMETA' ^ 0xFFFFFFFF);
		if (event.which==18 && event.location==1) this.modifiers &= getFlag('LEFTALT' ^ 0xFFFFFFFF);
		if (event.which==18 && event.location==2) this.modifiers &= getFlag('RIGHTALT' ^ 0xFFFFFFFF);

		/*
			Insert Code to include toggle states.
		*/
		if (event.code='CapsLock')
			state = event.getModifierState('CapsLock'); // current state of CapsLock: true or false (1 or 0)
			flag = getFlag('CAPSLOCK'); // get bitmask for CapsLock
			this.modifiers // current value for modifiers mask

		this.modifiers &= event.getModifierState('CapsLock') ^ 0xFFFFFFFF
		this.modifiers |= event.getModifierState( 'CapsLock' ) ? getFlag( 'CAPSLOCK' ) : 0;
		this.modifiers |= event.getModifierState( 'NumLock' ) ? getFlag( 'NUMLOCK' ) : 0;
		this.modifiers |= event.getModifierState( 'ScrollLock' ) ? getFlag( 'SCROLLLOCK' ) : 0;
		this.modifiers |= event.getModifierState('FuncLock') ? getFlag('FUNCLOCK'):0;

		return this.modifiers;

		function getFlag( aozModifierCode ) // return bitmask for specified modifier (aozModifierCode)
		{
			if ( AOZ.keyModifiers[ platform ][ aozModifierCode ] )
			{
				return AOZ.keyModifiers[ platform ][ aozModifierCode ];
			}
			return 0;
		} // getFlag( aozModifierCode )
	} // clearModifiers ( platform, event )

	function getModifiers( platform, event )
	{
		// get the shift state.
//		var modifiers = 0; // THIS should NOT be cleared every time! BJF 19 Aug
		this.modifiers |= event.which==16 && event.location==1 ? getFlag('LEFTSHIFT') : 0;
		this.modifiers |= event.which == 16 && event.location==2 ? getFlag('RIGHTSHIFT') : 0;
		this.modifiers |= event.which == 17 && event.location==1 ? getFlag('LEFTCONTROL') : 0;
		this.modifiers |= event.which == 17 && event.location==2 ? getFlag('RIGHTCONTROL') : 0;
		this.modifiers |= event.which == 91 ? getFlag('LEFTMETA') : 0;
		this.modifiers |= event.which == 93 ? getFlag('RIGHTMETA') : 0;
		this.modifiers |= event.which == 18 && event.location==1 ? getFlag('LEFTALT') : 0;
		this.modifiers |= event.which == 18 && event.location==2 ? getFlag('RIGHTALT') : 0;
		/*
		modifiers |= event.shiftKey ? ( event.location == 1 ? getFlag( 'LEFTSHIFT' ) : getFlag( 'RIGHTSHIFT' ) ) : 0;
		modifiers |= event.altKey ? ( event.location == 1 ? getFlag( 'LEFTALT' ) : getFlag( 'RIGHTALT' ) ) : 0;
		modifiers |= event.ctrlKey ? ( event.location == 1 ? getFlag( 'LEFTCONTROL' ) : getFlag( 'RIGHTCONTROL' ) ) : 0;
		// LEFTMETA is location 1, RIGHTMETA (ContextMenu) is location 0
		modifiers |= event.metaKey ? ( event.location == 1 ? getFlag( 'LEFTMETA' ) : getFlag( 'RIGHTMETA' ) ) : 0;
*/
		this.modifiers |= event.getModifierState( 'CapsLock' ) ? getFlag( 'CAPSLOCK' ) : 0;
		this.modifiers |= event.getModifierState( 'NumLock' ) ? getFlag( 'NUMLOCK' ) : 0;
		this.modifiers |= event.getModifierState( 'ScrollLock' ) ? getFlag( 'SCROLLLOCK' ) : 0;
		this.modifiers |= event.getModifierState('FuncLock') ? getFlag('FUNCLOCK'):0;

		// Do we also need InsertLock?

		return this.modifiers;

		function getFlag( aozModifierCode )
		{
			if ( AOZ.keyModifiers[ platform ][ aozModifierCode ] )
			{
				return AOZ.keyModifiers[ platform ][ aozModifierCode ];
			}
			return 0;
		} // getFlag( aozModifierCode )
	} // getModifiers
};
AOZ.prototype.convertToPlatform = function( platform, event )	// Convert to current platform (Todo: make Atari please)
{
	var result;
	if ( platform && AOZ.keyPressed[ platform ] )
	{
		var keyDef = AOZ.keyPressed[ platform ][ event.code ]; // Does key exist in this key map?
		if ( keyDef )
		{
			result =
			{
				key: getKey( keyDef.inkey$ ),
				keyCode: getKey( keyDef.keyCode )
			}
		}
		else
		{
			console.log('undefined key')
		}
	}
	return result;

	function getKey( value )
	{
		if ( value == 'event.key' )
			return event.key;
		else if ( value == 'event.code' )
			return event.code;
		else if ( value == 'event.which' )
			return event.which;
		return value;
	}
}; 


AOZ.prototype.startKeyboardInput = function( text )
{
	var self = this;
	self.positionKey$ = 0;
	self.stringKey$ += text;
	self.clearKeyFlag = false;

	if ( !self.handleKey$ ) // Make sure we're NOT already handling keys.
	{
		setTimeout( function()
		{
			self.handleKey$ = setInterval( function()
			{
				if ( self.clearKeyFlag )
				{
					clearInterval( self.handleKey$ );
					self.handleKey$ = null;
					self.stringKey$ = '';
				}
				else
				{
					self.modifiers = 0;
					// Check for embedded scan codes. BJF
					if ( self.stringKey$.indexOf( '$(SCAN', self.positionKey$ ) == self.positionKey$ )
					{
						var end = self.stringKey$.indexOf( 'SCAN)$', self.positionKey$ + 6 );
						if ( end > 0 )
						{
							self.lastKeycode = parseInt( self.stringKey$.substring( self.positionKey$ + 6, end ) );
							switch ( self.lastKeycode )
							{
								case 13: self.lastKeyPressed = 13; break;	// Return
								case 37: self.lastKeyPressed = 29; break;	// Left
								case 39: self.lastKeyPressed = 28; break;	// Right
								case 38: self.lastKeyPressed = 30; break;  	// Up
								case 40: self.lastKeyPressed = 31; break;	// Down
							}
						}
						self.positionKey$ = end + 6;
					} // Check for embedded scan code.
					// Check for MASK (modifiers)
					else if ( self.stringKey$.indexOf( '$(MASK', self.positionKey$ ) == self.positionKey$ )
					{
						var end = self.stringKey$.indexOf( 'MASK)$', self.positionKey$ + 6 );
						if ( end > 0 )
						{
							var mask = parseInt( self.stringKey$.substring( self.positionKey$ + 6, end ) );
// these shift states should be using the platform - BJF
							if ( ( mask & 0x0003 ) != 0 )			// Shift
								self.modifiers |= AOZ.SHIFT;
							else if ( ( mask & 0x0004 ) != 0 )		// Caps lock
								self.modifiers |= AOZ.SHIFT;
							else if ( ( mask & 0x0008 )	!= 0 )		// Ctrl
								self.modifiers |= AOZ.CONTROL;
							else if ( ( mask & 0x0030 ) != 0 )		// Alt
								self.modifiers |= AOZ.ALT;
							else if ( ( mask & 0x0040 ) != 0 )		// Meta
								self.modifiers |= AOZ.META;
						}
						self.positionKey$ = end + 6;
					} // Check for embedded MASK (modifiers)
					else
					{
						/*
						// Added new code: BJF 20 Aug
						var keyboardEvent = document.createEvent("KeyboardEvent");
						var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
						keyboardEvent[initMethod]
						(
							"keydown", true, true, window, false, false, false, false, false,
							self. stringKey$.substring( self.positionKey$++, end ) , // keyCode
							0 // charCode BJF
						);
						document.dispatchEvent(keyboardEvent); // BJF
						*/
						// Process the data here? BJF
						/*
						var key = this.key;
						if ( key )
						{
							this.key = null;
							this.lastKeyCode = this.keyCode;
							this.lastKeyName = this.keyName;
							this.lastModifiers = this.modifiers;
						*/
//						this.modifiers=self.modifiers; // BJF added.
						// BJF changed self. to this. below
						self.lastKeyPressed = self.stringKey$.charCodeAt( self.positionKey$++ );
					}

					if ( self.positionKey$ >= self.stringKey$.length )
					{
						// We scanned to the end of
						clearInterval( self.handleKey$ );
						self.handleKey$ = null;
						self.stringKey$ = '';
					}
				}
			}, 20 );
		}, 100 );
	}
}; // startKeyboardInput(text)

AOZ.prototype.debugOnKeyPress = function( key )
{
	if ( this.lastKeyName == key )
	{
		debugger;
	}
};
AOZ.prototype.putKey = function( text )
{
	this.startKeyboardInput( text );
};
AOZ.prototype.clearKey = function()
{
	this.lastKeyPressed = 0;
	this.clearKeyFlag = true;
};

AOZ.prototype.inkey$ = function()
{
	var key = this.key;
	if ( key )
	{
		this.key = null;
		this.lastKeyCode = this.keyCode;
		this.lastKeyName = this.keyName;
		this.lastModifiers = this.modifiers;
		switch (key)
		{
			case 'Enter':		key=String.fromCharCode(13); break;
			case 'CapsLock':	key=''; break;
			case 'Tab': 		key=String.fromCharCode(9); break;
			case 'Backspace': 	key=String.fromCharCode(8); break;
			case 'Escape': 		key=String.fromCharCode(27); break;
			case 'Shift': 		key=''; break;
 			case 'Control': 	key=''; break;
			case 'Alt': 		key=''; break;
			case 'Meta':		key=''; break;
			case 'ContextMenu':	key=''; break;
			case 'ArrowLeft':	key=String.fromCharCode(28); break;
			case 'ArrowRight':	key=String.fromCharCode(31); break;
			case 'ArrowUp':		key=String.fromCharCode(29); break;
			case 'ArrowDown':	key=String.fromCharCode(30); break;
			case 'Home':		key=''; break;
			case 'End':			key=''; break;
			case 'PageUp':		key=''; break;
			case 'PageDown':	key=''; break;
			case 'ScrollLock':	key=''; break;
			case 'NumLock':		key=''; break;
			case 'Insert':		key=''; break;
			case 'Delete':		key=''; break;
			case 'Clear':		key=''; break;
			case 'F1':			key=''; break;
			case 'F2':			key=''; break;
			case 'F3':			key=''; break;
			case 'F4':			key=''; break;
			case 'F5':			key=''; break;
			case 'F6':			key=''; break;
			case 'F7':			key=''; break;
			case 'F8':			key=''; break;
			case 'F9':			key=''; break;
			case 'F10':			key=''; break;
			case 'F11':			key=''; break;
			case 'F12':			key=''; break;
			case 'F13':			key=''; break;
			case 'Help':		key=''; break;
			default: ;
		}
		return key;
	}
	return '';
};

AOZ.prototype.getScanCode = function()
{
  var key = this.lastKeyCode;
  this.lastKeyCode=0;
  	if (key === undefined) { key = 0; } // BJF fix for bug #438
	return key;
};

AOZ.prototype.getKeyState = function( code )
{
	var result = this.keymap[code];
	if (typeof(result)==='undefined')
		return 0
	else
		return result;
};

AOZ.prototype.getScanShift = function()
{
  var modifiers = this.lastModifiers;
  this.lastModifiers=0;
  return modifiers;
};

AOZ.prototype.getKeyName = function()
{
  var keyName = this.lastKeyName;
  this.lastKeyName='';
  return keyName
};

AOZ.prototype.getKeyShift = function( shift )
{
	return this.modifiers;
};

AOZ.prototype.waitKey = function()
{
	this.keyName = undefined;
};
AOZ.prototype.waitKey_wait = function()
{
	if ( this.key )
	{
		this.key = undefined;
		this.keyName = '';
		this.keyCode = 0;
		this.lastKey = '';
		this.lastKeyCode = 0;
		this.lastKeyName = '';

		return true;
	}
	return false;
};
AOZ.prototype.waitVbl = function()
{
	this.waitVblCount = 2;
};
AOZ.prototype.waitVbl_wait = function()
{
	this.waitVblCount--;
	return ( this.waitVblCount == 0 );
};
AOZ.prototype.setKey$ = function( value, number, mask )
{
	if ( number <= 0 || number > 20 )
		throw 'illegal_function_call';
	this.key$[ number ] = value;
};
AOZ.prototype.getKey$ = function( number, mask )
{
	if ( number < 0 || number > 20 )
		throw 'illegal_function_call';
	return this.key$[ number ];
};
AOZ.prototype.scan$ = function( number, mask )
{
	var result = '$(SCAN' + number + 'SCAN)$';
	if ( typeof mask != 'undefined' )
	{
		result += '$(MASK' + mask + 'MASK)$';
	}
	return result;
};

AOZ.prototype.setVariable = function( variable, value )
{
	if ( !variable.dimensions )
	{
		if ( variable.parent )
			this.currentSection.parent.vars[ variable.name ] = value;
		else if ( variable.root )
			this.root.vars[ variable.name ] = value;
		else
			this.currentSection.vars[ variable.name ] = value;
	}
	else
	{
		if ( variable.parent )
			this.currentSection.parent.vars[ variable.name ].setValue( variable.dimensions, value );
		else if ( variable.root )
			this.root.vars[ variable.name ].setValue( variable.dimensions, value );
		else
			this.currentSection.vars[ variable.name ].setValue( variable.dimensions, value );
	}
};
AOZ.prototype.getVariable = function( variable )
{
	if ( !variable.dimensions )
	{
		if ( variable.parent )
			return this.currentSection.parent.vars[ variable.name ];
		else if ( variable.root )
			return this.root.vars[ variable.name ];
		else
			return this.currentSection.vars[ variable.name ];
	}
	else
	{
		if ( variable.parent )
			return this.currentSection.parent.vars[ variable.name ].getValue( variable.dimensions );
		else if ( variable.root )
			return this.root.vars[ variable.name ].getValue( variable.dimensions );
		else
			return this.currentSection.vars[ variable.name ].getValue( variable.dimensions );
	}
};
AOZ.prototype.input = function( args )
{
	this.inputArgs = args;
	this.inputPosition = 0;
	this.inputString = '';
	this.keyName = undefined;
	this.inputCursor = 0;
	if ( args.text != '' )
		this.currentScreen.currentTextWindow.print( args.text );
	else
		this.currentScreen.currentTextWindow.print( '?' );
	this.currentScreen.currentTextWindow.print( ' ' );
	this.inputXCursor = this.currentScreen.currentTextWindow.xCursor;
	this.currentScreen.currentTextWindow.anchorYCursor();
	this.currentScreen.currentTextWindow.forceCursor();
	// Force cursor on
}; // input(args)

AOZ.prototype.input_wait = function( args )
{
	if ( this.keyName )
	{
		switch ( this.keyName )
		{
			case 'Enter':
			case 'NumpadEnter':
				var previousComma = 0;
				var inputString;
				while( true )
				{
					var comma = this.inputString.indexOf( ',', previousComma );
					if ( this.inputArgs.variables.length > 1 && comma >= 0 && !this.inputArgs.isLineInput )
					{
						inputString = this.inputString.substring( previousComma, comma );
						previousComma = comma + 1;
					}
					else
					{
						inputString = this.inputString.substring( previousComma );
						previousComma = this.inputString.length;
					}
					var variable = this.inputArgs.variables[ this.inputPosition ];
					var value;
					if ( variable.type == 0 )
						value = inputString.length > 0 ? parseInt( inputString ) : 0;
					else if ( variable.type == 1 )
						value = inputString.length > 0 ? parseFloat( inputString ) : 0;
					else
						value = inputString;
					if ( variable.type != 2 && isNaN( value ) )
					{
						this.currentScreen.currentTextWindow.print( '', true );
						this.currentScreen.currentTextWindow.print( this.errors.getError( 'please_redo_from_start' ).message );
						this.inputXCursor = this.currentScreen.currentTextWindow.xCursor;
						this.currentScreen.currentTextWindow.anchorYCursor();
						this.inputPosition = 0;
						this.inputString = '';
						break;
					}
					this.setVariable( variable, value );
					this.inputPosition++;
					if ( this.inputPosition >= this.inputArgs.variables.length )
					{
						if ( this.inputArgs.newLine )
							this.currentScreen.currentTextWindow.print( '', true );
						this.key = null;
						this.currentScreen.currentTextWindow.restoreCursor();
						return true;
					}
					if ( previousComma >= this.inputString.length )
					{
						this.currentScreen.currentTextWindow.locate( { x: this.inputXCursor, y: this.currentScreen.currentTextWindow.yCursorAnchor } );
						this.currentScreen.currentTextWindow.cMove( { x: this.inputString.length, y: 0 } );
						this.currentScreen.currentTextWindow.print( '', true );
						this.currentScreen.currentTextWindow.print( '?? ' );
						this.inputXCursor = this.currentScreen.currentTextWindow.xCursor;
						this.currentScreen.currentTextWindow.anchorYCursor();
						this.inputString = '';
						this.inputCursor = 0;
						break;
					}
				}
				break;
			case 'ArrowLeft':
				if ( this.inputCursor > 0 )
				{
					this.inputCursor--;
					this.currentScreen.currentTextWindow.locate( { x: this.inputXCursor, y: this.currentScreen.currentTextWindow.yCursorAnchor } );
					this.currentScreen.currentTextWindow.cMove( { x: this.inputCursor, y: 0 } );
				}
				break;
			case 'ArrowRight':
				if ( this.inputCursor < this.inputString.length )
				{
					this.inputCursor++;
					this.currentScreen.currentTextWindow.locate( { x: this.inputXCursor, y: this.currentScreen.currentTextWindow.yCursorAnchor } );
					this.currentScreen.currentTextWindow.cMove( { x: this.inputCursor, y: 0 } );
				}
				break;
			case 'Backspace':
				if ( this.inputCursor > 0 )
				{
					this.inputCursor--;
					this.inputString = this.inputString.substring( 0, this.inputCursor ) + this.inputString.substring( this.inputCursor + 1 );
					this.currentScreen.currentTextWindow.locate( { x: this.inputXCursor, y: this.currentScreen.currentTextWindow.yCursorAnchor } );
					this.currentScreen.currentTextWindow.print( this.inputString + ' ' );
					this.currentScreen.currentTextWindow.locate( { x: this.inputXCursor, y: this.currentScreen.currentTextWindow.yCursorAnchor } );
					this.currentScreen.currentTextWindow.cMove( { x: this.inputCursor, y: 0 } );
				}
				break;
			case 'Del':
				if ( this.inputCursor < this.inputString.length )
				{
					this.inputString = this.inputString.substring( 0, this.inputCursor ) + this.inputString.substring( this.inputCursor + 1 );
					this.currentScreen.currentTextWindow.locate( { x: this.inputXCursor, y: this.currentScreen.currentTextWindow.yCursorAnchor } );
					this.currentScreen.currentTextWindow.print( this.inputString + ' ' );
					this.currentScreen.currentTextWindow.locate( { x: this.inputXCursor, y: this.currentScreen.currentTextWindow.yCursorAnchor } );
					this.currentScreen.currentTextWindow.cMove( { x: this.inputCursor, y: 0 } );
				}
				break;
			default:
				if ( this.key.length == 1 )
				{
					// Normal character
					this.inputString = this.inputString.substring( 0, this.inputCursor ) + this.key + this.inputString.substring( this.inputCursor );
					this.inputCursor++;
					this.currentScreen.currentTextWindow.locate( { x: this.inputXCursor, y: this.currentScreen.currentTextWindow.yCursorAnchor } );
					this.currentScreen.currentTextWindow.print( this.inputString );
					this.currentScreen.currentTextWindow.locate( { x: this.inputXCursor, y: this.currentScreen.currentTextWindow.yCursorAnchor } );
					this.currentScreen.currentTextWindow.cMove( { x: this.inputCursor, y: 0 }  );
				}
				break;
		}
		this.keyName = null;
	}
	return false;
};

AOZ.prototype.input$ = function( args )
{
	this.input$String = '';
	this.input$Length = args[ 0 ];
	if ( this.input$length <= 0 )
		throw 'illegal_function_call';
	this.key = undefined;
};
AOZ.prototype.input$_wait = function( args )
{
	if ( this.key )
	{
		if ( this.key.length == 1 )
			this.input$String += this.key;
		this.key = undefined;
	}
	if ( this.input$String.length >= this.input$Length )
	{
		return true;
	}
	return false;
};

// Mouse
AOZ.buttonToMouse =
{
	0: 0x0001,
	1: 0x0004,
	2: 0x0002
};
AOZ.prototype.setMouse = function()
{
	var self = this;
	this.renderer.canvas.onmousemove = function( event ) { self.onMouseMove( event ) };
	this.renderer.canvas.onmouseleave = function( event ) { self.onMouseLeave( event ) };
	this.renderer.canvas.onmouseenter = function( event ) { self.onMouseEnter( event ) };
	this.renderer.canvas.onmousedown = function( event ) { self.onMouseDown( event ) };
	this.renderer.canvas.onmouseup = function( event ) { self.onMouseUp( event ) };
	this.renderer.canvas.onclick = function( event ) { self.onClick( event ) };
	this.renderer.canvas.ondblclick = function( event ) { self.onDblClick( event ) };
	this.renderer.canvas.oncontextmenu = function( event ) { self.onContextMenu( event ) };
	document.onclick = function( event ) { self.onClickDocument( event ) };

	if ( document.body.addEventListener)
	{
    	document.body.addEventListener( 'mousewheel', function( event ){ self.onMouseWheel( event ) }, false );
    	document.body.addEventListener( 'DOMMouseScroll', function( event ) { self.onMouseWheel( event ) }, false );
	}
	else
	{
		document.body.attachEvent( 'onmousewheel', function( event ){ self.onMouseWheel( event ) } );
	}

	this.xMouse = 0;
	this.yMouse = 0;
	this.mouseInside = false;
	this.mouseButtons = 0;
	this.clickMouse = 0;
	this.doubleClick = false;
	this.wheelMouse = 0;
	this.mouseCurrent = 'auto';
	this.mouseShown = true;
	this.limitMouse = null;

	this.is_touch = 'ontouchstart' in window;
	this.ongoingTouches = new Array();
	this.touches = new Array();
	this.is_orientable = 'ondeviceorientation' in window;
	this.orientationX = 0;
	this.orientationY = 0;
	this.orientationZ = 0;
	this.is_accelerator = 'ondevicemotion' in window;
	this.accelerationX = 0;
	this.accelerationY = 0;
	this.accelerationZ = 0;
	this.latitude = 0.0;
	this.longitude = 0.0;
	this.already_fs = false;
	this.procName = undefined;

	if( 'ontouchstart' in window )
	{
		self.renderer.canvas.addEventListener( 'touchstart', function( event ){ self.onTouchStart( event ) }, false );
		self.renderer.canvas.addEventListener( 'touchmove', function( event ){ self.onTouchMove( event ) }, false );
		self.renderer.canvas.addEventListener( 'touchend', function( event ){ self.onTouchEnd( event ) }, false );
		self.renderer.canvas.addEventListener( 'touchcancel', function( event){ self.onTouchCancel( event ) }, false );
		self.renderer.canvas.addEventListener( 'touchleave', function( event ){ self.onTouchEnd( event ) }, false )
	}

	if( 'ondeviceorientation' in window )
	{
		window.addEventListener( 'deviceorientation', function( event ){ self.onDeviceOrientation( event ) }, false );
	}

	if( 'ondevicemotion' in window )
	{
		window.addEventListener( 'devicemotion', function( event ){ self.onDeviceMotion( event ) }, false );
	}

	if( 'onorientationchange' in window )
	{
		if( window.orientation === 90 || window.orientation === -90 )
		{
			self.orientation = 0;
		}
		else
		{
			self.orientation = 1;
		}

		window.addEventListener("orientationchange", function()
		{
			if( window.orientation === 90 || window.orientation === -90 )
			{
				self.orientation = 0;
			}
			else
			{
				self.orientation = 1;
			}
		}, false);
	}
};

AOZ.prototype.onMouseMove = function( event )
{
	this.xMouseDebug = event.clientX;
	this.yMouseDebug = event.clientY;

	var x = ( event.clientX - ( this.renderer.canvas.offsetLeft + this.renderer.xLeftDraw ) ) / this.renderer.xRatioDisplay + this.renderer.hardLeftX;
	var y = ( event.clientY - ( this.renderer.canvas.offsetTop + this.renderer.yTopDraw ) ) / this.renderer.yRatioDisplay + this.renderer.hardTopY;
	if ( this.manifest.compilation.platform == 'amiga' )
	{
		x = Math.round( x );
		y = Math.round( y );
	}
	if ( this.limitMouse )
	{
		if ( x < this.limitMouse.x )
			x = this.limitMouse.x;
		if ( x > this.limitMouse.x + this.limitMouse.width )
			x = this.limitMouse.x + this.limitMouse.width;
		if ( y < this.limitMouse.y )
			y = this.limitMouse.y;
		if ( y > this.limitMouse.y + this.limitMouse.height )
			y = this.limitMouse.y + this.limitMouse.height;
	}
	this.xMouse = x;
	this.yMouse = y;
	
	if( this.touchEmulation.active && this.touchEmulation.fingerOnScreen )
	{
		
		var touches = {
			identifier: 'mouse_emulation_0',
			clientX: event.clientX, 
			clientY: event.clientY,
			aozState: 2
		}
		
		var result = this.computeTouch( 0, touches );
		this.execTouchOnChange( result.x, result.y, result.lastX, result.lastY, 2 );
		this.touchEmulation.lastX = result.x;
		this.touchEmulation.lastY = result.y;
		this.ongoingTouches.splice( touches );
		this.updateTouches();		
	}	
}
AOZ.prototype.onMouseEnter = function( event )
{
	this.mouseInside = true;
}
AOZ.prototype.onMouseLeave = function( event )
{
	this.mouseInside = false;
}
AOZ.prototype.onMouseWheel = function( event )
{
	this.wheelMouse = Math.max( -1, Math.min( 1, ( event.wheelDelta || -event.detail ) ) );
}
AOZ.prototype.onMouseDown = function( event )
{
	this.mouseButtons |= AOZ.buttonToMouse[ event.button ];
	this.clickMouse = this.mouseButtons;
	
	if( this.touchEmulation.active )
	{
		
		var touches = {
			identifier: 'mouse_emulation_0',
			clientX: event.clientX, 
			clientY: event.clientY,
			aozState: 1
		}
		
		var result = this.computeTouch( 0, touches );
		this.touchEmulation.fingerOnScreen = true;
		this.execTouchOnChange( result.x, result.y, result.lastX, result.lastY, 1 );
		this.touchEmulation.lastX = -1;
		this.touchEmulation.lastY = -1;		
		this.ongoingTouches.push( touches );
		this.updateTouches();		
	}
}
AOZ.prototype.onMouseUp = function( event )
{
	this.mouseButtons &= ~AOZ.buttonToMouse[ event.button ];
	if( this.touchEmulation.active )
	{
		
		var touches = {
			identifier: 'mouse_emulation_0',
			clientX: event.clientX, 
			clientY: event.clientY,
			aozState: 3
		}
		
		this.touchEmulation.fingerOnScreen = false;
		var result = this.computeTouch( 0, touches );
		this.execTouchOnChange( result.x, result.y, result.lastX, result.lastY, 3 );
		this.touchEmulation.lastX = result.x;
		this.touchEmulation.lastY = result.y;		
		this.ongoingTouches.splice( touches );
		this.updateTouches();		
	}
}
AOZ.prototype.onClick = function( event )
{
	this.welcomeClick = true;
}
AOZ.prototype.onClickDocument = function( event )
{
	this.welcomeClick = true;
	if ( this.renderer.isInFullScreenIcon( { x: this.xMouseDebug, y: this.yMouseDebug } ) )
	{
		this.renderer.swapFullScreen();
	}
}
AOZ.prototype.onDblClick = function( event )
{
	this.doubleClick = true;
}
AOZ.prototype.onContextMenu = function( event )
{
	if (event.preventDefault != undefined )
		event.preventDefault();
	if( event.stopPropagation != undefined )
		event.stopPropagation();
}

AOZ.prototype.onTouchStart = function( event )
{
	event.preventDefault();

	this.welcomeClick = true;
	var touches = event.changedTouches;
	if( this.touches == undefined )
	{
		this.touches = new Array();
	}

	this.mouseButtons = 1;
	this.clickMouse = 1;

	for( var i = 0; i < touches.length; i++ )
	{
		touches[ i ].aozState = 1;
		var result = this.computeTouch( i, touches[ i ] );
		this.execTouchOnChange( result.x, result.y, result.lastX, result.lastY, 1 );
		this.ongoingTouches.push( touches[ i ] );
	}
	this.updateTouches();
}

AOZ.prototype.onTouchMove = function( event )
{
	event.preventDefault();

	var touches = event.changedTouches;
	this.mouseButtons = 1;
	this.clickMouse = 1;

	for( var i = 0; i < touches.length; i++ )
	{
		touches[ i ].aozState = 2;
		var result = this.computeTouch( i, touches[ i ] );

		var idx = this.getTouchById( touches[ i ].identifier );
		var result = this.computeTouch( i, touches[ i ] );
		this.execTouchOnChange( result.x, result.y, result.lastX, result.lastY, 2 );
		this.ongoingTouches.splice( idx, 1, touches[ i ] );
	}
	this.updateTouches();
}

AOZ.prototype.onTouchEnd = function( event )
{
	event.preventDefault();

	var touches = event.changedTouches;
	this.touches = new Array();

	this.removeTouches = new Array();

	this.mouseButtons = 0;
	this.clickMouse = 0;

	for( var i = 0; i < touches.length; i++ )
	{
		touches[ i ].aozState = 3;
		var idx = this.getTouchById( touches[ i ].identifier );
		var result = this.computeTouch( i, touches[ i ] );
		this.execTouchOnChange( result.x, result.y, result.lastX, result.lastY, 3 );
		this.ongoingTouches.splice( idx, 1 );
	}
	this.updateTouches();
}

AOZ.prototype.onTouchCancel = function( event )
{
	event.preventDefault();
	var touches = event.changedTouches;

	for( var i = 0; i < touches.length; i++ )
	{
		this.ongoingTouches.splice( i, 1 );
	}
	this.updateTouches();
}
AOZ.prototype.onDeviceOrientation = function( event )
{
	event.preventDefault();

	this.orientationX = event.gamma;
	this.orientationY = event.beta;
	this.orientationZ = event.alpha;

}

AOZ.prototype.onDeviceMotion = function( event )
{
	event.preventDefault();

	self.accelerationX = event.accelerationIncludingGravity.x;
	self.accelerationY = event.accelerationIncludingGravity.y;
	self.accelerationZ = event.accelerationIncludingGravity.z;

}

AOZ.prototype.getTouchById = function( idToFind )
{

	for( var i = 0; i < this.ongoingTouches.length; i++ )
	{
		var id = this.ongoingTouches[ i ].identifier;

		if( id == idToFind )
		{
			return i;
		}
	}
	return -1;
}

AOZ.prototype.updateTouches = function()
{
	this.touches = new Array();

	for( i = 0; i < this.ongoingTouches.length; i++ )
	{
		var result = this.computeTouch( i, this.ongoingTouches[ i ] );
		this.touches.push( { x: result.x, y: result.y, state: this.ongoingTouches[ i ].aozState } );

		if( i == 0 )
		{
			this.xMouseDebug = this.touches[ i ].clientX;
			this.yMouseDebug = this.touches[ i ].clientY;
			this.xMouse = result.x;
			this.yMouse = result.y;
		}
	}
};

AOZ.prototype.computeTouch = function( i, touch )
{
	var x = ( touch.clientX - ( this.renderer.canvas.offsetLeft + this.renderer.xLeftDraw ) ) / this.renderer.xRatioDisplay + this.renderer.hardLeftX;
	var y = ( touch.clientY - ( this.renderer.canvas.offsetTop + this.renderer.yTopDraw ) ) / this.renderer.yRatioDisplay + this.renderer.hardTopY;
	if( this.manifest.compilation.platform == 'amiga' )
	{
		x = Math.round( x );
		y = Math.round( y );
		}
	if ( this.limitMouse )
	{
		if ( x < this.limitMouse.x )
			x = this.limitMouse.x;
		if ( x > this.limitMouse.x + this.limitMouse.width )
			x = this.limitMouse.x + this.limitMouse.width;
		if ( y < this.limitMouse.y )
			y = this.limitMouse.y;
		if ( y > this.limitMouse.y + this.limitMouse.height )
			y = this.limitMouse.y + this.limitMouse.height;
	}

	var ni = i;
	if( this.ongoingTouches )
	{
		for( ii = 0; ii < this.ongoingTouches.length; ii++ )
		{
			if( this.ongoingTouches[ ii ].identifier == touch.identifier )
			{
				ni = ii;
				break;
			}
		}
	}

	var lastX = x;
	var lastY = y;
	if ( this.ongoingTouches[ ni ] )
	{
		lastX = ( this.ongoingTouches[ ni ].clientX - ( this.renderer.canvas.offsetLeft + this.renderer.xLeftDraw ) ) / this.renderer.xRatioDisplay + this.renderer.hardLeftX;
		lastY = ( this.ongoingTouches[ ni ].clientY - ( this.renderer.canvas.offsetTop + this.renderer.yTopDraw ) ) / this.renderer.yRatioDisplay + this.renderer.hardTopY;
		if( this.manifest.compilation.platform == 'amiga' )
			{
			lastX = Math.round( x );
			lastY = Math.round( y );
			}
		if ( this.limitMouse )
		{
			if ( lastX < this.limitMouse.x )
				lastX = this.limitMouse.x;
			if ( lastX > this.limitMouse.x + this.limitMouse.width )
				lastX = this.limitMouse.x + this.limitMouse.width;
			if ( lastY < this.limitMouse.y )
				lastY = this.limitMouse.y;
			if ( lastY > this.limitMouse.y + this.limitMouse.height )
				lastY = this.limitMouse.y + this.limitMouse.height;
		}
	}
	
	if( this.touchEmulation.active )
	{
		if( this.touchEmulation.lastX == - 1 )
		{
			this.touchEmulation.lastX = x;
		}

		if( this.touchEmulation.lastY == - 1 )
		{
			this.touchEmulation.lastY = y;
		}
		
		lastX = this.touchEmulation.lastX;
		lastY = this.touchEmulation.lastY;
	}
	return { x: x, y: y, lastX: lastX, lastY: lastY };
};

AOZ.prototype.touchOnChange = function( procName )
{
	this.procName = procName;
};

AOZ.prototype.execTouchOnChange = function( x, y, lastX, lastY, state )
{
	if( this.procName == undefined || this.procName == '' )
	{
		return;
	}
	var args = 
		{
		X: Number( x ).toFixed( 3 ),
		Y: Number( y ).toFixed( 3 ),
		LASTX: Number( lastX ).toFixed( 3 ),
		LASTY: Number( lastY ).toFixed( 3 ),
		STATE: state
	};
	this.runProcedure( this.procName, args );
};

AOZ.prototype.geoLocation = function()
{
	var self = this;
	navigator.geolocation.getCurrentPosition( function( position )
	{
		self.latitude = position.coords.latitude;
		self.longitude = position.coords.longitude;
	});
};

AOZ.prototype.getTouchX = function( index )
{
	if( this.touches[ index ] == undefined )
	{
		return -1;
	}
	return this.touches[ index ].x;
};

AOZ.prototype.getTouchY = function( index )
{
	if( this.touches[ index ] == undefined )
	{
		return -1;
	}
	return this.touches[ index ].y;
};

AOZ.prototype.getTouchState = function( index )
{
	if( this.touches[ index ] == undefined )
	{
		return -1;
	}
	return this.touches[ index ].state;
};

AOZ.prototype.setMouseLimits = function( rectangle )
{
	this.limitMouse = rectangle;
};
AOZ.prototype.xor = function( a, b )
{
	return ( a && !b ) || ( !a && b );
};
AOZ.prototype.mouseScreen = function()
{
	return this.screenIn( undefined, this.xMouse, this.yMouse );
};
AOZ.prototype.mouseWheel = function()
{
	var temp = this.wheelMouse;
	this.wheelMouse = 0;
	return temp;
};
AOZ.prototype.showMouse = function( flag )
{
	if ( flag != this.mouseShown )
	{
		this.mouseShown = flag;
		if ( !flag )
			this.renderer.canvas.style.cursor = 'none';
		else
			this.renderer.canvas.style.cursor = this.mouseCurrent;
	}
};
AOZ.prototype.mouseClick = function()
{
	var click = this.clickMouse;
	this.clickMouse = 0;
	return click;
};
AOZ.prototype.changeMouse = function( type )
{
	switch ( type )
	{
		case 1:
		case 'default':
		case 'auto':
		default:
			this.mouseCurrent = 'auto';
			break;
		case 'crosshair':
		case 2:
			this.mouseCurrent = 'crosshair';
			break;
		case 'wait':
		case 3:
			this.mouseCurrent = 'wait';
			break;
		case 'pointer':
		case 4:
			this.mouseCurrent = 'pointer';
	}
	if ( this.mouseShown )
		this.renderer.canvas.style.cursor = this.mouseCurrent;
};
AOZ.prototype.xHard = function( x, screen )
{
	screen = this.getScreen( screen );
};
AOZ.prototype.yHard = function( y, screen )
{
	screen = this.getScreen( screen );
	return y * screen.renderScaleY + screen.y;
};
AOZ.prototype.xScreen = function( x, screen )
{
	screen = this.getScreen( screen );
	return ( x - screen.x ) / screen.renderScaleX / screen.displayScale.x;
};
AOZ.prototype.yScreen = function( y, screen )
{
	screen = this.getScreen( screen );
	return ( y - screen.y ) / screen.renderScaleY / screen.displayScale.x;
};
AOZ.prototype.isIn = function( x, y )
{
	x = ( x - screen.x ) / screen.renderScaleX;
	y = ( y - screen.y ) / screen.renderScaleY;
	this.currentScreen.isIn( x, y );
};
AOZ.prototype.hZone = function( number, x, y )
{
	var screen = this.getScreen( number );
	x = ( x - screen.x ) / screen.renderScaleX;
	y = ( y - screen.y ) / screen.renderScaleY;
	return screen.zone( number, x, y );
};
AOZ.prototype.mouseZone = function()
{
	return this.hZone( undefined, this.xMouse, this.yMouse );
};
AOZ.prototype.setXMouse = function( x )
{
	this.xMouse = x;
};
AOZ.prototype.setYMouse = function( y )
{
	this.yMouse = y;
};
AOZ.prototype.getXMouse = function( x )
{
	return this.xMouse;
};
AOZ.prototype.getYMouse = function( y )
{
	return this.yMouse;
};

// Data/read
AOZ.prototype.read = function( section, type )
{
	if ( section.dataPosition >= section.datas.length )
		throw( 'out_of_data' );

	var value = section.datas[ section.dataPosition++ ];
	if ( typeof value == 'function' )
		value = value.call( section, this, section.vars );
	if ( type == 0 || type == 1 )
	{
		if ( typeof value == 'string' )
			throw( 'type_mismatch' );
	}
	else
	{
		if ( typeof value != 'string' )
			throw( 'type_mismatch' );
	}
	return value;
};
AOZ.prototype.add = function( section, variable, plus, start, end )
{
	var number = this.getVariableFromDescription( section, variable );
	number += plus;
	if ( typeof start != 'undefined' && typeof end != 'undefined' )
	{
		if ( number > end )
			number = start;
		if ( number < start )
			number = end;
	}
	this.setVariableFromDescription( section, variable, number );
};
AOZ.prototype.getVariableFromDescription = function( section, variable )
{
	var result;
	if ( variable.dimensions )
	{
		if ( !variable.root )
			result = section.vars[ variable.name ].getValue( variable.dimensions );
		else
			result = this.root.vars[ variable.name ].getValue( variable.dimensions );
	}
	else
	{
		if ( !variable.root )
			result = section.vars[ variable.name ];
		else
			result = this.root.vars[ variable.name ];
	}
	return result;
};
AOZ.prototype.setVariableFromDescription = function( section, variable, value )
{
	if ( variable.dimensions )
	{
		if ( !variable.root )
			section.vars[ variable.name ].setValue( variable.dimensions, value );
		else
			this.root.vars[ variable.name ].setValue( variable.dimensions, value );
	}
	else
	{
		if ( !variable.root )
			section.vars[ variable.name ] = value;
		else
			this.root.vars[ variable.name ] = value;
	}
};


// AOZ Array class
function AArray( aoz, defaultValue, oneBased )
{
	this.aoz = aoz;
	this.defaultValue = defaultValue;
	this.oneBased = oneBased;
};
AArray.prototype.dim = function( dimensions )
{
	if ( typeof this.array != 'undefined' )
	{
		this.aoz.error = 10;
		return;
	}
	var self = this;
	this.dimensions = dimensions;
	this.array = createArray( 0 );
	function createArray( d )
	{
		var arr = [];
		if ( d == dimensions.length - 1 )
		{
			for ( var dd = 0; dd <= dimensions[ d ]; dd++ )
				arr[ dd ] = self.defaultValue;
		}
		else
		{
			for ( var dd = 0; dd <= dimensions[ d ]; dd++ )
				arr[ dd ] = createArray( d + 1 );
		}
		return arr;
	}
}
AArray.prototype.getValue = function( dimensions )
{
	var obj = this.getVariable( dimensions );
	return obj.array[ obj.pointer ];
};
AArray.prototype.setValue = function( dimensions, value )
{
	var obj = this.getVariable( dimensions );
	obj.array[ obj.pointer ] = value;
};
AArray.prototype.sort = function( dimensions )
{
	var obj = this.getVariable( dimensions );
	if ( typeof this.defaultValue == 'string' )
		obj.array = obj.array.sort();
	else
	{
		obj.array = obj.array.sort( function( a, b )
		{
			return a - b;
		} );
	}
};
AArray.prototype.match = function( dimensions, value )
{
	if ( dimensions.length > 1 )
		throw 'illegal_function_call';
	var arr = this.getVariable( dimensions ).array;
	for ( var d = 0; d < arr.length; d++ )
	{
		if ( arr[ d ] == value )
		{
			return d;
		}
	}
	return -1;
};
AArray.prototype.inc = function( dimensions )
{
	var obj = this.getVariable( dimensions );
	obj.array[ obj.pointer ]++;
};
AArray.prototype.dec = function( dimensions )
{
	var obj = this.getVariable( dimensions );
	obj.array[ obj.pointer ]--;
};
AArray.prototype.read = function( dimensions, value )
{
	var obj = this.getVariable( dimensions );
	obj.array[ obj.pointer ]--;
};
AArray.prototype.getVariable = function( dimensions )
{
	if ( typeof this.array == 'undefined' )
		throw 'non_dimensionned_array';
	var pArr = this.array;
	for ( var d = 0; d < this.dimensions.length - 1; d++ )
	{
		dd = dimensions[ d ] - this.oneBased;
		if ( dd < 0 || dd > this.dimensions[ d ] )
			throw 'illegal_function_call';
		pArr = pArr[ dd ];
	}
	var dd = dimensions[ d ] - this.oneBased;
	if ( dd < 0 || dd > this.dimensions[ d ] )
	{
		throw 'illegal_function_call';
	}
	return { array: pArr, pointer: dd };
};


// Instruction set
AOZ.prototype.string$ = function( text, number )
{
	if ( number < 0 )
		throw 'illegal_function_call';
	var result = '';
	var chr = text.charAt( 0 );
	for ( var c = 0; c < number; c++ )
		result += chr;
	return result;
};
AOZ.prototype.flip$ = function( text )
{
	var result = '';
	for ( var c = text.length -1; c >= 0; c-- )
		result += text.charAt( c );
	return result;
};
AOZ.prototype.getLeft$ = function( text, position )
{
	if ( position < 0 )
		throw( 'illegal_function_call' );
	return text.substring( 0, position );
};
AOZ.prototype.setLeft$ = function( text, variable, position )
{
	this.setMid$( text, variable, 0, position );
};
AOZ.prototype.getMid$ = function( text, start, len )
{
	if ( start < 0 )
		throw( 'illegal_function_call' );

	start = Math.max( start - 1, 0 );
	if ( typeof len == 'undefined' )
		len = text.length;
	else if ( len < 0 )
		throw( 'illegal_function_call )' );

	return text.substr( start, len );
};
AOZ.prototype.setMid$ = function( text, variable, start, len )
{
	if ( start < 0 )
		throw( 'illegal_function_call' );
	start = Math.max( start - 1, 0 );

	if ( typeof len == 'undefined' )
		len = text.length;
	else if ( len < 0 )
		throw( 'illegal_function_call )' );

	var value = this.getVariable( variable );
	if ( start > value.length )
		start = value.length;
	len = Math.min( len, text.length );
	if ( start + len > value.length )
		len = value.length - start;
	value = value.substring( 0, start ) + text.substr( 0, len ) + value.substring( start + len );
	this.setVariable( variable, value );
};
AOZ.prototype.getRight$ = function( text, len )
{
	if ( len < 0 )
		throw( 'illegal_function_call )' );

	return text.substring( text.length - len );
};
AOZ.prototype.setRight$ = function( text, variable, len )
{
	var value = this.getVariable( variable );
	if ( typeof len == 'undefined' )
		len = value.length;
	if ( len < 0 )
		throw( 'illegal_function_call )' );

	len = Math.min( len, value.length );
	var start = Math.max( 0, value.length - len );
	len = Math.min( len, text.length );
	value = value.substring( 0, start ) + text.substr( 0, len ) + value.substring( start + len );
	this.setVariable( variable, value );
};
AOZ.prototype.subtractString = function( string1, string2 )
{
	return this.utilities.replaceStringInText( string1, string2, '' );
};
AOZ.prototype.wait = function( args )
{
	var delay = args[ 0 ];
	if ( delay < 0 )
		throw( 'illegal_function_call' );
	this.waitEnd = new Date().getTime() + ( this.platform != 'aoz' ? delay * 20 : delay * 1000 );
};
AOZ.prototype.wait_wait = function()
{
	var now = new Date().getTime();
	return ( now >= this.waitEnd );
};
AOZ.prototype.bin$ = function( value, digits )
{
	var result = value.toString( 2 );
	if ( typeof value != 'undefined' )
	{
		if ( value < 0 )
			throw 'illegal_function_call';
		for ( var l = result.length; l < digits; l++ )
			result = '0' + result;
	}
	return '%' + result;
};
AOZ.prototype.hex$ = function( value, digits )
{
	var result = value.toString( 16 ).toUpperCase();
	if ( typeof value != 'undefined' )
	{
		if ( value < 0 )
			throw 'illegal_function_call';
		for ( var l = result.length; l < digits; l++ )
			result = '0' + result;
	}
	return '$' + result;
};
AOZ.prototype.instr = function( text, search, position )
{
	if ( position < 0 )
		throw 'illegal_function_call';
	if ( typeof position == 'undefined' )
		position = 1;
	position = Math.max( position - 1, 0 );
	var result = text.indexOf( search, position );
	if ( result >= 0 )
		return result + 1;
	return 0;
};
AOZ.prototype.setTimer = function( time )
{
	if ( time < 0 )
		throw 'illegal_function_call';
	this.timer = time;
};
AOZ.prototype.getTimer = function()
{
	return this.platform == 'aoz' ?  this.timer : Math.floor( this.timer );
};

// Mersene Twister random generator
AOZ.prototype.rnd = function( value )
{
	if ( typeof value != 'undefined' )
	{
	if ( this.merseneTwister )
	{
		var number = this.merseneTwister.genrand_res53() * ( value + 1 );
		return Math.floor( number );
	}
	if ( Math.floor( value ) == value )
		return Math.floor( Math.random() * ( value + 1 ) );
	else
		return Math.random() * value;
	}
	return Math.random();
};
AOZ.prototype.randomize = function( initial )
{
	this.merseneTwister = new MersenneTwister( initial );
}

function MersenneTwister( seed )
{
	if ( seed == undefined )
	{
	  	seed = new Date().getTime();
	}
	this.N = 624;
	this.M = 397;
	this.MATRIX_A = 0x9908b0df;
	this.UPPER_MASK = 0x80000000;
	this.LOWER_MASK = 0x7fffffff;

	this.mt = new Array(this.N);
	this.mti=this.N+1;

	this.init_genrand(seed);
}

MersenneTwister.prototype.init_genrand = function( s )
{
	this.mt[ 0 ] = s >>> 0;
	for ( this.mti=1; this.mti < this.N; this.mti++ )
	{
		var s = this.mt[ this.mti -1 ] ^ ( this.mt[ this.mti -1 ] >>> 30 );
		this.mt[ this.mti ] = ( ( ( ( ( s & 0xffff0000 ) >>> 16 ) * 1812433253 ) << 16 ) + ( s & 0x0000ffff ) * 1812433253 ) + this.mti;
		this.mt[ this.mti ] >>>= 0;
	}
}
MersenneTwister.prototype.genrand_int32 = function()
{
	var y;
	var mag01 = new Array( 0x0, this.MATRIX_A );

	if ( this.mti >= this.N )
	{
	  	var kk;

	  	if ( this.mti == this.N+1 )
			this.init_genrand( 5489 );

		for ( kk=0; kk< this.N - this.M; kk++ )
		{
			y = ( this.mt[ kk ] & this.UPPER_MASK ) | ( this.mt[ kk + 1 ] & this.LOWER_MASK );
			this.mt[ kk ] = this.mt[ kk + this.M ] ^ ( y >>> 1 ) ^ mag01[ y & 0x1 ];
	  	}
		for ( ; kk < this.N - 1; kk++ )
		{
			y = ( this.mt[ kk ] & this.UPPER_MASK ) | ( this.mt[ kk + 1 ] & this.LOWER_MASK );
			this.mt[ kk ] = this.mt[ kk + ( this.M - this.N ) ] ^ ( y >>> 1 ) ^ mag01[ y & 0x1 ];
	  	}
	  	y = ( this.mt[ this.N - 1] & this.UPPER_MASK ) | ( this.mt[ 0 ] & this.LOWER_MASK );
	  	this.mt[ this.N - 1 ] = this.mt[ this.M - 1 ] ^ ( y >>> 1 ) ^ mag01[ y & 0x1 ];
  		this.mti = 0;
	}

	y = this.mt[ this.mti++ ];

	y ^= ( y >>> 11 );
	y ^= ( y << 7 ) & 0x9d2c5680;
	y ^= ( y << 15 ) & 0xefc60000;
	y ^= ( y >>> 18 );

	return y >>> 0;
}

MersenneTwister.prototype.genrand_real1 = function()
{
	return this.genrand_int32()*(1.0/4294967295.0);
}
MersenneTwister.prototype.genrand_res53 = function()
{
	var a = this.genrand_int32() >>> 5, b = this.genrand_int32() >>> 6;
	return( a * 67108864.0 + b ) * ( 1.0 / 9007199254740992.0 );
}

//
// MEMORY BANKS
//
AOZ.prototype.allocMemoryBlock = function( data, endian )
{
	var memoryBlock = new MemoryBlock( this, data, endian );
	memoryBlock.memoryHash = this.memoryNumbers++;
	if ( this.memoryNumber > 9000 )
		this.memoryNumber = 1;
	this.memoryBlocks.push( memoryBlock );
	return memoryBlock;
};
AOZ.prototype.freeMemoryBlock = function( block )
{
	for ( var b = 0; b < this.memoryBlocks.length; b++ )
	{
		if ( this.memoryBlocks[ b ] == block )
		{
			this.memoryBlocks = this.utilities.slice( this.memoryBlocks, b, 1 );
			break;
		}
	}
};
AOZ.prototype.getMemoryBlockFromAddress = function( address )
{
	var index = Math.floor( address / this.memoryHashMultiplier );
	for ( var b = 0; b < this.memoryBlocks.length; b++ )
	{
		if ( this.memoryBlocks[ b ].memoryHash == index )
		{
			return this.memoryBlocks[ b ];
		}
	}
	throw 'illegal_function_call';
};
AOZ.prototype.getMemory = function( number )
{
	var result;
	var index = Math.floor( number / this.memoryHashMultiplier );
	if ( index == 0 )
	{
		var bank = this.banks.getBank( number );
		if ( !bank.isType( [ 'picpac', 'amal', 'work', 'tracker', 'data' ] ) )
			throw 'bank_type_mismatch';
		result =
		{
			bank: bank,
			block: bank.getElement( 1 ),
			start: this.banks.getStart( number ),
			length: this.banks.getLength( number )
		};
	}
	else
	{
		var block = this.getMemoryBlockFromAddress( number );
		result =
		{
			block: block,
			start: number,
			length: block.length
		}
	}
	return result;
};
AOZ.prototype.poke = function( address, value )
{
	var memoryBlock = this.getMemoryBlockFromAddress( address );
	memoryBlock.poke( address, value );
};
AOZ.prototype.doke = function( address, value )
{
	var memoryBlock = this.getMemoryBlockFromAddress( address );
	memoryBlock.doke( address, value );
};
AOZ.prototype.loke = function( address, value )
{
	var memoryBlock = this.getMemoryBlockFromAddress( address );
	memoryBlock.loke( address, value );
};
AOZ.prototype.peek = function( address )
{
	var memoryBlock = this.getMemoryBlockFromAddress( address );
	return memoryBlock.peek( address, false );
};
AOZ.prototype.deek = function( address )
{
	var memoryBlock = this.getMemoryBlockFromAddress( address );
	return memoryBlock.deek( address, false );
};
AOZ.prototype.leek = function( address )
{
	var memoryBlock = this.getMemoryBlockFromAddress( address );
	return memoryBlock.leek( address, false );
};
AOZ.prototype.poke$ = function( address, text )
{
	var memoryBlock = this.getMemoryBlockFromAddress( address );
	memoryBlock.poke$( address, text );
};
AOZ.prototype.doke$ = function( address, text )
{
	var memoryBlock = this.getMemoryBlockFromAddress( address );
	memoryBlock.doke$( address, text );
};
AOZ.prototype.peek$ = function( address, length, stop )
{
	var memoryBlock = this.getMemoryBlockFromAddress( address );
	return memoryBlock.peek$( address, length, stop );
};
AOZ.prototype.deek$ = function( address, length, stop )
{
	var memoryBlock = this.getMemoryBlockFromAddress( address );
	return memoryBlock.deek$( address, length, stop );
};
AOZ.prototype.fill = function( start, end, value )
{
	var startBlock = this.getMemoryBlockFromAddress( start );
	var endBlock = this.getMemoryBlockFromAddress( end );
	if ( startBlock != endBlock )
		throw 'illegal_function_call';
	startBlock.fill( start, end, value );
};
AOZ.prototype.copy = function( source, length, destination )
{
	var sourceBlock = this.getMemoryBlockFromAddress( source );
	sourceBlock.copy( destination, length );
};
AOZ.prototype.hunt = function( start, end, text )
{
	var startBlock = this.getMemoryBlockFromAddress( start );
	var endBlock = this.getMemoryBlockFromAddress( end );
	if ( startBlock != endBlock )
		throw 'illegal_function_call';
	return startBlock.hunt( start, end, text );
};






AOZ.prototype.bSet = function( variable, shift )
{
	var value = this.getVariable( variable );
	this.setVariable( variable, value | ( 1 << shift ) );
};
AOZ.prototype.bClr = function( variable, shift )
{
	var value = this.getVariable( variable );
	this.setVariable( variable, value & ( ~( 1 << shift ) ) );
};
AOZ.prototype.bChg = function( variable, shift )
{
	var value = this.getVariable( variable );
	this.setVariable( variable, value ^ ( 1 << shift ) );
};
AOZ.prototype.rolB = function( variable, shift )
{
	var value = this.getVariable( variable );
	var carry = ( value & 0x80 ) != 0 ? 0x01 : 0x00;
	this.setVariable( variable, ( value & 0xFFFFFF00 ) | ( ( value << shift ) & 0xFF ) | carry );
};
AOZ.prototype.rolW = function( variable, shift )
{
	var value = this.getVariable( variable );
	var carry = ( value & 0x8000 ) != 0 ? 0x01 : 0x00;
	this.setVariable( variable, ( value & 0xFFFF0000 ) | ( ( value << shift ) & 0xFFFF ) | carry );
};
AOZ.prototype.rolL = function( variable, shift )
{
	var value = this.getVariable( variable );
	var carry = ( value & 0x80000000 ) != 0 ? 0x01 : 0x00;
	this.setVariable( variable, ( value << shift ) | carry );
};
AOZ.prototype.rorB = function( variable, shift )
{
	var value = this.getVariable( variable );
	var carry = ( value & 0x01 ) != 0 ? 0x80 : 0x00;
	this.setVariable( variable, ( value & 0xFFFFFF00 ) | ( ( value >>> shift ) & 0xFF ) | carry );
};
AOZ.prototype.rorW = function( variable, shift )
{
	var value = this.getVariable( variable );
	var carry = ( value & 0x01 ) != 0 ? 0x8000 : 0x0000;
	this.setVariable( variable, ( value & 0xFFFF0000 ) | ( ( value >>> shift ) & 0xFFFF ) | carry );
};
AOZ.prototype.rorL = function( variable, shift )
{
	var value = this.getVariable( variable );
	var carry = ( value & 0x01 ) != 0 ? 0x80000000 : 0x00000000;
	this.setVariable( variable, ( value >>> shift ) | carry );
};

// Gamepads
AOZ.GAMEPAD_FIRE		= 0;
AOZ.GAMEPAD_UP			= 12;
AOZ.GAMEPAD_DOWN		= 13;
AOZ.GAMEPAD_RIGHT		= 15;
AOZ.GAMEPAD_LEFT		= 14;
AOZ.GAMEPAD_A			= 0;
AOZ.GAMEPAD_B			= 1;
AOZ.GAMEPAD_X			= 2;
AOZ.GAMEPAD_Y			= 3;
AOZ.GAMEPAD_STICKLEFT	= 10;
AOZ.GAMEPAD_STICKRIGHT	= 11;
AOZ.GAMEPAD_BOTTOMLEFT	= 6;
AOZ.GAMEPAD_TOPLEFT		= 4;
AOZ.GAMEPAD_BOTTOMRIGHT	= 7;
AOZ.GAMEPAD_TOPRIGHT	= 5;
AOZ.GAMEPAD_CENTERLEFT	= 8;
AOZ.GAMEPAD_CENTERRIGHT	= 9;
AOZ.GAMEPAD_HAXELEFT	= 0;
AOZ.GAMEPAD_VAXELEFT	= 1;
AOZ.GAMEPAD_HAXERIGHT	= 2;
AOZ.GAMEPAD_VAXERIGHT	= 3;
AOZ.MAPPING_BUTTONS		= 0;  // ???
AOZ.MAPPING_AXES		= 16;
AOZ.MAPPING_TRIGGERS	= 32;

AOZ.prototype.setGamepads = function()
{
	  //
	 // initialize gamepadMaps{} and gamepads objects.
	//
	this.gamepadMaps = {};
	this.gamepads = navigator.getGamepads();
	    //
	   // Add required event handlers for connecting / disconnecting gamepads.
	  // NOTE:	When connecting/disconnecting a gamepad, need to create/destroy the
	 //			gamepad data structures for the for the indicated gamepad index.
	//
	window.addEventListener("gamepadconnected", function(e)
	{ 
		// 1. See if mapping exists for this gamepad.
		//   a. If so, load that mapping structure.
		//   b. If not, create structure from the default mapping.
	});

	window.addEventListener("gamepaddisconnected", function(e)
	{ 
		// Dispose of mapping structure for this gamepad index.
	});

}; // setGamepads

AOZ.prototype.scanGamepads = function() // I think this may have been placed here in lieu of the connect & disconnect events.
{										// It may no longer be needed once those are in place.
	this.gamepads = navigator.getGamepads(); // This is also called by setGamepads.
};

AOZ.prototype.getMapping = function( gamepad, key, delta )
{
	/*
	if ( gamepad.mapping == 'standard' )
		return key;
// alert(gamepad.id); // BJF
	if ( this.gamepadMaps[ gamepad.id ] )
	{
		var keyMapped = this.gamepadMaps[ gamepad.id ][ key + delta ];
		if ( typeof keyMapped != 'undefined' )
			return keyMapped;
	}
	*/
	return key;
}; // getMapping

AOZ.prototype.getKeyMapping = function( key )
{
	var code = this.manifest.gamepad.mapping[ key ]; 
	if ( code )
	{
		var info = this.convertToPlatform( this.platformKeymap, { code: code } );
		if ( info && info.keyCode != 'undefined' )
		{
			return this.keymap[ info.keyCode ];
		}
	}
	return false;
}; // getKeyMapping

AOZ.prototype.setKeyMapping = function( direction, keycode )
{
	if (this.manifest.gamepad.mapping[direction])
	{
		this.manifest.gamepad.mapping[direction]=keycode
	}
	else 
	{
		throw('Invalid JoyKey function');
	}
} // setKeyMapping

AOZ.prototype.lockJoystick = function( state, lock, direction )
{
	if ( lock )
	{
		if ( state )
		{
			if ( this.joyLock[ direction ] ) 
				state = false;
			this.joyLock[ direction ] = true;
		}
		else
		{
			this.joyLock[ direction ] = false;
		}
	}	
	return state ? this.platformTrue : false;
}; // lockJoystick

// For jUp, jDown, jLeft, jRight
// Default "LEFT" is Axis(0)=-1
// Default "RIGHT" is Axis(0)=1
// Default "UP" is Axis(1) = -1
// Default "DOWN" is Axis(1) = 1

// Digital gamepad Up function, but usually read as analog and converted to digital.
AOZ.prototype.jUp = function( number, lock )
{
	if (this.gamepads)
	{
		if ( number >= 0 && number < this.gamepads.length )
		{
			var gamepad = this.gamepads[ number ];
			if ( gamepad && gamepad.connected )
			{
				return 	(this.lockJoystick( 
							(this.gamepadAxis(number,1) < (-this.gamepad_Threshold) ) || // analog to digital emulation
							(this.getKeyMapping( 'up' )), lock, 'up' )); // keyboard emulation
			}
		}
	}
	return this.lockJoystick( this.getKeyMapping( 'up' ), lock, 'up' );
}; // jUp

// Digital gamepad Down function, but usually read as analog and converted to digital.
AOZ.prototype.jDown = function( number, lock )
{
	if ( this.gamepads )
	{
		if ( number >= 0 && number < this.gamepads.length )
		{
			var gamepad = this.gamepads[ number ];
			if ( gamepad && gamepad.connected )
			{
				return	(this.lockJoystick( 
							(this.gamepadAxis(number,1) > (this.gamepad_Threshold) ) || 
							(this.getKeyMapping( 'down' )), lock, 'down' ));
			}
		}
	}
	return this.lockJoystick( this.getKeyMapping( 'down' ), lock, 'down' );
}; // jDown

// Digital gamepad Left function, but usually read as analog and converted to digital.
AOZ.prototype.jLeft = function( number, lock )
{
	if ( this.gamepads )
	{
		if ( number >= 0 && number < this.gamepads.length )
		{
			var gamepad = this.gamepads[ number ];
			if ( gamepad && gamepad.connected )
			{
				return	(this.lockJoystick( 
							( this.gamepadAxis(number,0) < (-this.gamepad_Threshold) ) ||
							(this.getKeyMapping( 'left' )), lock, 'left' ));
			}
		}
	}
	return this.lockJoystick( this.getKeyMapping( 'left' ), lock, 'left' );
}; // jLeft

// Digital gamepad Right function, but usually read as analog and converted to digital.
AOZ.prototype.jRight = function( number, lock )
{
	if ( this.gamepads )
	{
		if ( number >= 0 && number < this.gamepads.length )
		{
			var gamepad = this.gamepads[ number ];
			if ( gamepad && gamepad.connected )
			{
				return	(this.lockJoystick( 
							(this.gamepadAxis(number,0) > (this.gamepad_Threshold)) ||
							(this.getKeyMapping( 'right' )), lock, 'right' ));
			}
		}
	}
	return this.lockJoystick( this.getKeyMapping( 'right' ), lock, 'right' );
}; // jRight

// Digital gamepad Up & Left function, but usually read as analog and converted to digital.
AOZ.prototype.jUpLeft = function( number, lock )  // BJF
{
	if ( this.gamepads )
	{
		if ( number >= 0 && number < this.gamepads.length )
		{
			var gamepad = this.gamepads[ number ];
			if ( gamepad && gamepad.connected )
			{
				return	(this.lockJoystick( 
							(this.gamepadAxis(number,1) < (-this.gamepad_Threshold) &&
								this.gamepadAxis(number,0) < (-this.gamepad_Threshold)) || 
							( this.getKeyMapping( 'up' ) & this.getKeyMapping( 'left' )), lock, 'upleft' ));
			}
		}
	}
	return this.lockJoystick( this.getKeyMapping( 'up' ) & this.getKeyMapping( 'left' ), lock, 'upleft' );
}; // jUpLeft

// Digital gamepad Up & Right function, but usually read as analog and converted to digital.
AOZ.prototype.jUpRight = function( number, lock ) // BJF
{
	if ( this.gamepads )
	{
		if ( number >= 0 && number < this.gamepads.length )
		{
			var gamepad = this.gamepads[ number ];
			if ( gamepad && gamepad.connected )
			{
				return	(this.lockJoystick( 
							(this.gamepadAxis(number,1) < (-this.gamepad_Threshold) && 
								this.gamepadAxis(number,0) > (this.gamepad_Threshold)) || 
							(this.getKeyMapping( 'up' ) & this.getKeyMapping( 'right' )), lock, 'upright' ));
			}
		}
	}
	return this.lockJoystick( this.getKeyMapping( 'up' ) & this.getKeyMapping( 'right' ), lock, 'upright' );
}; // jUpRight

// Digital gamepad Down & Left function, but usually read as analog and converted to digital.
AOZ.prototype.jDownLeft = function( number, lock ) // BJF
{
	if ( this.gamepads )
	{
		if ( number >= 0 && number < this.gamepads.length )
		{
			var gamepad = this.gamepads[ number ];
			if ( gamepad && gamepad.connected )
			{
				return	(this.lockJoystick( 
							(this.gamepadAxis(number,1) > (this.gamepad_Threshold) &&
								this.gamepadAxis(number,0) < (-this.gamepad_Threshold)) ||
							(this.getKeyMapping( 'down' ) & this.getKeyMapping( 'left' )), lock, 'downleft' ));
			}
		}
	}
	return this.lockJoystick( this.getKeyMapping( 'down' ) & this.getKeyMapping( 'left' ), lock, 'downleft' );
}; // jDownLeft

// Digital gamepad Down & Right function, but usually read as analog and converted to digital.
AOZ.prototype.jDownRight = function( number, lock ) // BJF
{
	if ( this.gamepads )
	{
		if ( number >= 0 && number < this.gamepads.length )
		{
			var gamepad = this.gamepads[ number ];
			if ( gamepad && gamepad.connected )
			{
				return	(this.lockJoystick( 
							(this.gamepadAxis(number,1) > (this.gamepad_Threshold) &&
								this.gamepadAxis(number,0) > (this.gamepad_Threshold)) ||
							(this.getKeyMapping( 'down' ) & this.getKeyMapping( 'right' )), lock, 'downright' )); 
			}
		}
	}
	return this.lockJoystick( this.getKeyMapping( 'down' ) & this.getKeyMapping( 'right' ), lock, 'downright' );
}; // jDownRight

AOZ.prototype.fire = function( number, lock )
{
	if ( this.gamepads )
	{
		if ( number >= 0 && number < this.gamepads.length )
		{   
			var gamepad = this.gamepads[ number ];
			if ( gamepad && gamepad.connected )
			{	// Button 0 is usually the main fire button.
				// Some browsers use "pressed", while others use "value", so check both.
//				console.log(gamepad.buttons[0].pressed || gamepad.buttons[0].value ? 1 : 0);
//				console.log(-Math.abs((gamepad.buttons[0].pressed) || gamepad.buttons[0].value)));
				return	this.lockJoystick( 
//							((-Math.abs((gamepad.buttons[0].pressed || gamepad.buttons[0].value))) ||
							((gamepad.buttons[0].pressed || gamepad.buttons[0].value) || 
								(this.getKeyMapping( 'fire' ))), lock );
			}
		}
	}
	return this.lockJoystick( this.getKeyMapping( 'fire' ), lock );
}; // fire

AOZ.prototype.joy = function( number )
{
	var result = 0;
	if ( this.gamepads )
	{
		if ( number >= 0 && number < this.gamepads.length )
		{
			var gamepad = this.gamepads[ number ];
			if ( gamepad && gamepad.connected )
			{
				if ( gamepad.mapping == 'standard' )
				{
					result |= gamepad.buttons[ this.getMapping( gamepad, AOZ.GAMEPAD_UP,	AOZ.MAPPING_BUTTONS ) ].pressed	? 0x01 : 0x00;
					result |= gamepad.buttons[ this.getMapping( gamepad, AOZ.GAMEPAD_DOWN,	AOZ.MAPPING_BUTTONS ) ].pressed	? 0x02 : 0x00;
					result |= gamepad.buttons[ this.getMapping( gamepad, AOZ.GAMEPAD_LEFT,	AOZ.MAPPING_BUTTONS ) ].pressed	? 0x04 : 0x00;
					result |= gamepad.buttons[ this.getMapping( gamepad, AOZ.GAMEPAD_RIGHT,	AOZ.MAPPING_BUTTONS ) ].pressed	? 0x08 : 0x00;
					result |= gamepad.buttons[ this.getMapping( gamepad, AOZ.GAMEPAD_FIRE,	AOZ.MAPPING_BUTTONS ) ].pressed	? 0x10 : 0x00;
					return result;
				}
			}
		}
	}
	result |= this.getKeyMapping( 'up' )	? 0x01 : 0x00;
	result |= this.getKeyMapping( 'down' )	? 0x02 : 0x00;
	result |= this.getKeyMapping( 'left' )	? 0x04 : 0x00;
	result |= this.getKeyMapping( 'right' )	? 0x08 : 0x00;
	result |= this.getKeyMapping( 'fire' )	? 0x10 : 0x00;
	return result;
}; // joy

//
// NOTE:  Need the events:	gamepadConnected
//							gamepadDisconnected
// (since everything changes when gamepads are plugged in or unplugged)
//
AOZ.prototype.gamepadDisconnected = function( number )	// BJF Added
{

} // gamepadDisconnected

AOZ.prototype.gamepadConnected = function( number )
{
	if ( this.gamepads )
	{
		if (number >= 0 && number < this.gamepads.length)
		{
			return ( this.gamepads && this.gamepads[ number ] && this.gamepads[ number ].connected ) ? this.platformTrue : false;
		}
	}
	return 0
}; // gamepadConnected

AOZ.prototype.gamepadName$= function(number) // BJF added
{
	if (this.gamepads) // gamepads object exists
	{
		if (number >= 0 && number < this.gamepads.length)
		{
			var gamepad = this.gamepads[number];
			if (gamepad && gamepad.connected)
			{
				return gamepad.id;
			}
		}
	}
	return '';
}; // gamepadName$(n)

AOZ.prototype.gamepadVendor$= function(number) // BJF added
{
	if (this.gamepads) // gamepads object exists
	{
		if (number >= 0 && number < this.gamepads.length)
		{
			var gamepad = this.gamepads[number];
			if (gamepad && gamepad.connected)
			{
				return gamepad.id; // later change to ONLY Vendor$
			}
		}
	}
	return '';
}; // gamepadVendor$(n)

AOZ.prototype.gamepadProduct$= function(number) // BJF added
{
	if (this.gamepads) // gamepads object exists
	{
		if (number >= 0 && number < this.gamepads.length)
		{
			var gamepad = this.gamepads[number];
			if (gamepad && gamepad.connected)
			{
				return gamepad.id; // later change to ONLY Product$
			}
		}
	}
	return '';
}; // gamepadProduct$(n)

AOZ.prototype.gamepadNumAxes = function (number) // BJF added 9/1
{
	if (this.gamepads)
	{
		if (number >= 0 && number < this.gamepads.length)
		{
			var gamepad=this.gamepads[number];
			if (gamepad && gamepad.connected)
				return gamepad.axes.length;
		}
	}
	return 0
} // gamepadAxes

AOZ.prototype.gamepadNumButtons = function (number) // BJF added 9/1
{
	if (this.gamepads)
	{
		if (number >= 0 && number < this.gamepads.length)
		{
			var gamepad = this.gamepads[ number ];
			if (gamepad && gamepad.connected)
				return gamepad.buttons.length
		}
	}
	return 0
} // gamepadButtons

AOZ.prototype.gamepadAxis = function( number, axis )
{
	if (this.gamepads)
	{
		if (number >= 0 && number < this.gamepads.length)
		{
			var gamepad = this.gamepads[ number ];
			if ( gamepad && gamepad.connected )
	   		{
				if ( gamepad.axes )
				{
					var value = gamepad.axes[ this.getMapping( gamepad, axis, AOZ.MAPPING_AXES ) ];
					return typeof value != 'undefined' ? value : 0;
				}
			}
	   	}
   	}
	return 0;
}; // gamepadAxis

AOZ.prototype.gamepadButton = function( number, button )
{
	if (this.gamepads)
	{
		if (number >= 0 && number < this.gamepads.length)
		{
			var gamepad = this.gamepads[ number ];
			if ( gamepad && gamepad.connected )
			{
				b = gamepad.buttons[button];
//			var b = gamepad.buttons[ this.getMapping( gamepad, button, AOZ.MAPPING_BUTTONS ) ];
				return (b.pressed || b.value) ? this.platformTrue : false;
			}
	   	}
   	}
	return 0;
}; // gamepadButton

AOZ.prototype.gamepadTrigger = function( number, trigger )
{
	if (this.gamepads)
	{
		if (number >= 0 && number < this.gamepads.length)
		{
			var gamepad = this.gamepads[ number ];
			if ( gamepad && gamepad.connected )
			{
				if ( gamepad.mapping == 'standard' )
				{
					trigger = ( trigger == 0 ? AOZ.GAMEPAD_BOTTOMLEFT : AOZ.GAMEPAD_BOTTOMRIGHT );
					return gamepad.buttons[ trigger ].value;
				}
				else if ( gamepad.axes )
				{
					var value = gamepad.axes[ this.getMapping( gamepad, trigger, AOZ.MAPPING_TRIGGERS ) ];
					return typeof value != 'undefined' ? value : 0;
				}
			}
		}
	}
	return 0;
}; // gamepadTrigger

// Set font
AOZ.prototype.setFont= function( args )
{
	var self = this;
	this.fontLoaded = false;
	this.currentScreen.setFont( args[ 0 ], args[ 1 ], args[ 2 ], args[ 3 ], args[ 4 ], function( response, data, extra )
	{
		if ( response )
			self.fontLoaded = true;
		else
			throw 'cannot_load_font';
	} );
}
AOZ.prototype.setFont_wait = function( channel, source, address )
{
	return this.fontLoaded;
};

///////////////////////////////////////////////////////////////////////////
//
// Animation channels
//
///////////////////////////////////////////////////////////////////////////
AOZ.prototype.getChannel = function( type, index, errorString )
{
	if ( type == 'bob' )
		return this.aoz.currentScreen.getBob( index, errorString ? 'bob' + errorString : undefined );
	else if ( type == 'sprite' )
		return this.aoz.getSprite( index, errorString ? 'sprite' + errorString : undefined );
	return undefined;
};
AOZ.prototype.getAnimationChannel = function( channelNumber, throwError )
{
	var channel = this.aoz.channelsTo[ channelNumber ];
	if ( channel )
		return channel;
	if ( throwError )
		throw throwError;
	return null;
};
AOZ.prototype.getActiveAnimationChannel = function( channelNumber, throwError )
{
	var channel = this.aoz.channelsTo[ channelNumber ];
	if ( channel )
	{
		channel.thisObject = channel.getThis( channel.objectNumber );
		if ( channel.thisObject )
		{
			return channel;
		}
	}
	if ( throwError )
		throw throwError;
	return null;
};
AOZ.prototype.newAnimationChannel = function( channelNumber, objectNumber, objectType, force, throwError )
{
	if ( !force )
	{
		var channel = this.aoz.channelsTo[ channelNumber ];
		if ( channel )
		{
			return channel;
		}
	}
	var newChannel =
	{
		aoz: this.aoz,
		type: objectType,
		objectNumber: objectNumber,
		channelNumber: channelNumber,
		getThis: function( index ){ return null; },
		get_X: function(){ return 0; },
		get_Y: function(){ return 0; },
		set_X: function(){},
		set_Y: function(){},
		get_Image: function(){ return 0; },
		set_Image: function(){},
		thisObject: undefined
	};
	switch ( objectType )
	{
		case 'sprite':
			newChannel.getThis = Sprite.prototype.getThis;
			newChannel.get_X = Sprite.prototype.get_X;
			newChannel.get_Y = Sprite.prototype.get_Y;
			newChannel.set_X = Sprite.prototype.set_X;
			newChannel.set_Y = Sprite.prototype.set_Y;
			newChannel.get_Image = Sprite.prototype.get_Image;
			newChannel.set_Image = Sprite.prototype.set_Image;
			break;
		case 'bob':
			newChannel.getThis = Bob.prototype.getThis;
			newChannel.get_X = Bob.prototype.get_X;
			newChannel.get_Y = Bob.prototype.get_Y;
			newChannel.set_X = Bob.prototype.set_X;
			newChannel.set_Y = Bob.prototype.set_Y;
			newChannel.get_Image = Bob.prototype.get_Image;
			newChannel.set_Image = Bob.prototype.set_Image;
			break;
		case 'screen display':
			newChannel.getThis = Screen.prototype.getThis;
			newChannel.get_X = Screen.prototype.get_X;
			newChannel.get_Y = Screen.prototype.get_Y;
			newChannel.set_X = Screen.prototype.set_X;
			newChannel.set_Y = Screen.prototype.set_Y;
			break;
		case 'screen size':
			newChannel.getThis = Screen.prototype.getThis;
			newChannel.get_X = Screen.prototype.get_XSize;
			newChannel.get_Y = Screen.prototype.get_YSize;
			newChannel.set_X = Screen.prototype.set_XSize;
			newChannel.set_Y = Screen.prototype.set_YSize;
			break;
		case 'screen offset':
			newChannel.getThis = Screen.prototype.getThis;
			newChannel.get_X = Screen.prototype.get_XOffset;
			newChannel.get_Y = Screen.prototype.get_YOffset;
			newChannel.set_X = Screen.prototype.set_XOffset;
			newChannel.set_Y = Screen.prototype.set_YOffset;
			break;
		case 'rainbow':
			newChannel.getThis = this.moduleRainbows.Rainbow.prototype.getThis;
			newChannel.get_X = this.moduleRainbows.Rainbow.prototype.get_X;
			newChannel.get_Y = this.moduleRainbows.Rainbow.prototype.get_Y;
			newChannel.set_X = this.moduleRainbows.Rainbow.prototype.set_X;
			newChannel.set_Y = this.moduleRainbows.Rainbow.prototype.set_Y;
			newChannel.get_Image = this.moduleRainbows.Rainbow.prototype.get_Image;
			newChannel.set_Image = this.moduleRainbows.Rainbow.prototype.set_Image;
			break;
		default:
			throw { error: 'channel_type_not_defined', parameter: objectType };
	}
	this.channelsTo[ channelNumber ] = newChannel;
	return newChannel;
};

AOZ.prototype.destroyChannel = function( channel )
{	
	switch ( channel.className )
	{
		case 'bob':
			channel.screen.destroyBob( channel.index );
			break;
		case 'sprite':
			this.sprites.destroy( channel.index );
			break;
		default:
			this.removeRootObjectFromSynchro( channel );
			break;
	}
};
AOZ.prototype.getGamepadAutoMove= function ()
{
	return this.gamepad_AutoMove ? this.platformTrue : false
}

AOZ.prototype.getGamepadKeyboard= function ()
{
	return this.gamepad_Keyboard ? this.platformTrue : false
}

AOZ.prototype.getGamepadTreshold= function () // BJF
{
	return this.gamepad_Threshold
}


// Animations primitives
AOZ.prototype.getAnimation = function( channel, name, angle )
{
	var clip;

		// Already running?
		name = name.toLowerCase();
	if ( ( channel.currentClip && channel.currentClip.initialized && name == channel.currentClip.vars.name.toLowerCase() ) && channel.currentDirection == angle )
			return channel.currentClip;

		// Find new clip
	var deltas = [];
	for ( var c = 0; c < channel.clip.length; c++ )
		deltas[ c ] = 1000;
	for ( var c = 0; c < channel.clip.length; c++ )
		{
		if ( channel.clip[ c ].vars.name == name )
			{
			deltas[ c ] = Math.abs( channel.clip[ c ].vars.direction - angle );
			}
		}
	var bestDelta = 1000;
	for ( var c = 0; c < channel.clip.length; c++ )
		{
		if ( channel.clip[ c ].vars.name.toLowerCase() == name )
			{
			if ( deltas[ c ] < bestDelta )
				{
				bestDelta = deltas[ c ];
				clip = channel.clip[ c ];
				}
			}
		}
	// Not found-> get the first one.
	if ( !clip )
		clip = channel.clip[ 0 ];

	var previousClip = channel.currentClip;
	if ( clip != previousClip )
		{
		channel.currentClip = clip;
		channel.clip_current = clip;
			channel.currentDirection = angle;
	
				this.sections.push( null );
		var section = clip[ 'start_m' ];
				section.vars.channel = channel;
				section.vars.previousClip = previousClip;
				section.position = 0;
				try
				{
					this.runBlocks( section, false );
				}
				catch( error )
				{
					this.handleErrors( error );
				}
			}
	return clip;
};
AOZ.prototype.callAnimations = function( channel, deltaTime )
{
	var angle = ( channel.movement_current ? ( channel.movement_current.vars.rotation ? channel.movement_current.angle : 0 ) : 0 );
	if ( channel.clip && channel.clip.length > 0 )
	{
		var speed = ( channel.movement_current ? channel.movement_current.speed : 1000 );
		var toRotate = ( channel.movement_current ? channel.movement_current.vars.rotation : false );
		var name = ( speed == 0 ? 'static' : 'moving' );
		var clip = this.getAnimation( channel, name, angle );
		if ( clip )
		{
			this.sections.push( null );
			var section = clip[ 'animate_m' ];
			section.vars.channel = channel;
			section.vars.deltaTime = deltaTime;
			section.vars.speed = speed;
			section.position = 0;
			try
			{
				this.runBlocks( section, false );
			}
			catch( error )
			{
				this.handleErrors( error );
			}
			if ( toRotate )	
				channel.set_Angle( angle );
		}
	}
	else
	{
		var toRotate = ( channel.movement_current ? channel.movement_current.vars.rotation : false );
		if ( toRotate )
			channel.set_Angle( angle );
	}
};
AOZ.prototype.setAnimState = function( index, className, state )
{
	for ( var o = 0; o < this.synchroList.length; o++ )		
	{
		var channel = this.synchroList[ o ];
		if ( channel.animations )
		{
			var doIt = true;
			if ( typeof className != 'undefined' && channel.className != className )
				doIt = false;
			if ( typeof index != 'undefined' && index != channel.index )
				doIt = false;
			if ( doIt )
			{
				for ( var a in channel.animations )
				{ 
					for ( var aa = 0; aa < channel.animations[ a ].length; aa++ )
						channel.animations[ a ][ aa ].setState( state );
				}		
			}
		}
	}
};
AOZ.prototype.setMoveState = function( index, className, state )
{
	for ( var o = 0; o < this.synchroList.length; o++ )		
	{
		var channel = this.synchroList[ o ];
		if ( channel.movement )
		{
			var doIt = true;
			if ( typeof className != 'undefined' && channel.className != className )
				doIt = false;
			if ( typeof index != 'undefined' && index != channel.index )
				doIt = false;
			if ( doIt )
				channel.movement.setState( state );
		}
	}
};


///////////////////////////////////////////////////////////////////////////
//
// AMAL!
//
///////////////////////////////////////////////////////////////////////////
AOZ.prototype.amalOnOff = function( onOff, channelNumber )
{
	this.amal.setOnOff( onOff, channelNumber );
}
AOZ.prototype.amalStart = function( args )
{
	var channelNumber = args[ 0 ];
	var source = args[ 1 ];
	var address = args[ 2 ];
	var compiler = new AMALCompiler( this );
	if ( typeof source == 'number' )
		debugger;						// TODO please ;)

	this.amalErrors = [];
	this.amalErrorNumberCount = 0;
	this.amalErrorStringCount = 0;
	var code = compiler.compile( source, {} )
	if ( this.utilities.isArray( code ) )
	{
		this.amalErrors = code;
		throw 'amal_error';
	}

	var self = this;
	this.amalStarted = false;
	this.aoz.channelsTo[ channelNumber ];
	var channelObject = this.aoz.newAnimationChannel( channelNumber, channelNumber, 'sprite', false );	
	if ( !channelObject )
		throw 'channel_not_opened';
	this.amal.runChannel( channelObject, code, function( response, data, extra )
	{
		if ( !response )
			throw 'illegal_function_call';

		self.amalStarted = true;
/*
		var activeChannel = self.aoz.getActiveAnimationChannel( channelNumber );
		if ( activeChannel && data && data.toUpdate )
		{
			if ( typeof data.x != 'undefined' )
				activeChannel.setX.call( activeChannel.thisObject, data.x );
			if ( typeof data.y != 'undefined' )
				activeChannel.setY.call( activeChannel.thisObject, data.y );
			if ( typeof data.image != 'undefined' )
				activeChannel.setImage.call( activeChannel.thisObject, data.image );
		}
*/
	} );
};
AOZ.prototype.amalStart_wait = function( channel, source, address )
{
	return this.amalStarted;
};

AOZ.prototype.amalError = function()
{
	if ( this.amalErrorNumberCount < this.amalErrors.length )
	{
		return this.amalErrors[ this.amalErrorNumberCount++ ].position;
	}
	return 0;
};

AOZ.prototype.amalError$ = function()
{
	if ( this.amalErrorStringCount < this.amalErrors.length )
	{
		return this.errors.getError( this.amalErrors[ this.amalErrorStringCount++ ].error );
	}
	return '';
};

//
// fp2Int - Return the integer portion of a floating point number.
//
AOZ.prototype.fp2Int =function ( f ) // BJF
{
	 if ( f < 0 )
	 	return Math.ceil(f)
	 else
	 	return Math.floor(f);
};

/*
AOZ.ptototype.setGamepadThreshold= function ( t ) // BJF
{
	this.gamepad_Threshold = t;
}
*/


