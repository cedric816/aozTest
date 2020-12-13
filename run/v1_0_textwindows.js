/*@****************************************************************************
*
*   █████╗  ██████╗ ███████╗    ███████╗████████╗██╗   ██╗██████╗ ██╗ ██████╗
*  ██╔══██╗██╔═══██╗╚══███╔╝    ██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██╔═══██╗
*  ███████║██║   ██║  ███╔╝     ███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║
*  ██╔══██║██║   ██║ ███╔╝      ╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║
*  ██║  ██║╚██████╔╝███████╗    ███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝
*  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝    ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝
*
****************************************************************************@*/
//
// The Text Window Instructions
// By Francois Lionet
// Version 0.99
// 11/11/2019
// (c) AOZ Studio 2019
//
// Compilé avec AOZ Transpiler Version Beta 2 le 23/11/2020-13:51:42
//

function v1_0_textwindows( aoz, args )
{
	this.aoz=aoz;
	this.parent=this;
	this.root=this;
	this.manifest=JSON.parse(atob('eyJ2ZXJzaW9uIjoiOSIsInZlcnNpb25Nb2R1bGUiOiIxIiwiaW5mb3MiOnsiYXBwbGljYXRpb25OYW1lIjoiVGhlIFRleHQgV2luZG93IEluc3RydWN0aW9ucyIsImF1dGhvciI6IkJ5IEZyYW5jb2lzIExpb25ldCIsInZlcnNpb24iOiJWZXJzaW9uIDAuOTkiLCJkYXRlIjoiMTEvMTEvMjAxOSIsImNvcHlyaWdodCI6IihjKSBBT1ogU3R1ZGlvIDIwMTkiLCJzdGFydCI6InRleHR3aW5kb3dzLmFveiJ9LCJjb21waWxhdGlvbiI6eyJub1dhcm5pbmciOlsiaW5zdHJ1Y3Rpb25fbm90X2ltcGxlbWVudGVkIl0sImVycm9ycyI6eyJlbiI6W10sImZyIjpbXX0sImRpc3BsYXlFbmRBbGVydCI6ZmFsc2UsImRpc3BsYXlFcnJvckFsZXJ0Ijp0cnVlfSwiYm9vdFNjcmVlbiI6eyJhY3RpdmUiOmZhbHNlLCJ3YWl0U291bmRzIjpmYWxzZSwiY2xpY2tTb3VuZHMiOmZhbHNlfSwiZXJyb3JzIjp7fX0='));
	this.vars=typeof args=='undefined'?{}:args;
	this.contextName='v1_0_textwindows';
	this.aoz[ "module" + "Textwindows" ]=this;
	this.aoz.finalWait++;
	

	this.blocks=[];
	this.blocks[0]=function(aoz,args)
	{
		// Javascript
		this.aoz.moduleTextWindows = this;
		this.readText = function( args )
		{
			var self = this;
			this.read_done = false;
			var address = args[ 1 ];
			var length = args[ 2 ];
			if ( typeof address == 'undefined' )
			{
				var descriptor = this.aoz.filesystem.getFile( args[ 0 ] );
				this.aoz.filesystem.loadFile( descriptor, { responseType: 'text' }, function( response, text, extra )
				{
					if ( response )
					{
						var reader = new TextReader( this.aoz, descriptor.filename, text, {}, function( response, data, extra )
						{
							self.read_done = true;
						} );
					}
					else
					{
						self.read_done = false;
						self.error = 'cannot_load_file';
					}
				} );
			}
			else
			{
				var info = self.aoz.getMemory( address );
				var text = info.block.extractString( info.start, typeof length != 'undefined' ? length : info.length );
				var reader = new TextReader( this.aoz, args[ 0 ], text, {}, function( response, data, extra )
				{
					self.read_done = true;
				} );
			}
		};
		this.read_wait = function()
		{
			if ( this.read_done )
			{
				if ( this.error )
					throw this.error;
				return true;
			}
			return false;
		};
		// End Javascript
		return{type:0}
	};
	this.blocks[1]=function(aoz,args)
	{
		return{type:0}
	};
	this.aoz.run(this,0,null);
};
