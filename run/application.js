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
// Name of your application.
// By You
// Version 0.0
// Created on the ...
// (c) Your Corporation Unlimited
//
// Compilé avec AOZ Transpiler Version Beta 2 le 12/12/2020-13:18:27
//

function Application( canvasId, args )
{
	this.root=this;
	this.parent=this;
	this.contextName='application';
	this.manifest=JSON.parse(atob('eyJ2ZXJzaW9uIjoiOSIsImluZm9zIjp7ImFwcGxpY2F0aW9uTmFtZSI6Ik5hbWUgb2YgeW91ciBhcHBsaWNhdGlvbi4iLCJhdXRob3IiOiJCeSBZb3UiLCJ2ZXJzaW9uIjoiVmVyc2lvbiAwLjAiLCJkYXRlIjoiQ3JlYXRlZCBvbiB0aGUgLi4uIiwiY29weXJpZ2h0IjoiKGMpIFlvdXIgQ29ycG9yYXRpb24gVW5saW1pdGVkIiwic3RhcnQiOiJtYWluLmFveiJ9LCJjb21waWxhdGlvbiI6eyJwbGF0Zm9ybSI6ImFveiIsImtleW1hcCI6ImFveiIsIm1hY2hpbmUiOiJtb2Rlcm4iLCJzcGVlZCI6ImZhc3QiLCJzeW50YXgiOiJlbmhhbmNlZCIsImVuZGlhbiI6ImxpdHRsZSIsIm5vV2FybmluZyI6W10sImRpc3BsYXlFbmRBbGVydCI6ZmFsc2UsImRpc3BsYXlFcnJvckFsZXJ0Ijp0cnVlLCJ1c2VMb2NhbFRhYnMiOnRydWV9LCJkaXNwbGF5Ijp7InR2U3RhbmRhcmQiOiJwYWwiLCJ3aWR0aCI6MTI4MCwiaGVpZ2h0Ijo3MjAsImJhY2tncm91bmQiOiJjb2xvciIsImJhY2tncm91bmRDb2xvciI6IiMwMDAwMDAiLCJib2R5QmFja2dyb3VuZENvbG9yIjoiIzAwMDAwMCIsImJvZHlCYWNrZ3JvdW5kSW1hZ2UiOiIuL3J1bnRpbWUvcmVzb3VyY2VzL3N0YXJfbmlnaHQuanBlZyIsInNjYWxlWCI6MSwic2NhbGVZIjoxLCJzY3JlZW5TY2FsZSI6MSwiZnBzIjpmYWxzZSwiZnBzRm9udCI6IjEycHggVmVyZGFuYSIsImZwc0NvbG9yIjoiI0ZGRkYwMCIsImZwc1giOjEwLCJmcHNZIjoxNiwiZnVsbFBhZ2UiOnRydWUsImZ1bGxTY3JlZW4iOnRydWUsImtlZXBQcm9wb3J0aW9ucyI6dHJ1ZSwiZnVsbFNjcmVlbkljb24iOmZhbHNlLCJmdWxsU2NyZWVuSWNvblgiOi0zNCwiZnVsbFNjcmVlbkljb25ZIjoyLCJmdWxsU2NyZWVuSWNvbkltYWdlIjoiLi9ydW50aW1lL3Jlc291cmNlcy9mdWxsX3NjcmVlbi5wbmciLCJzbWFsbFNjcmVlbkljb25JbWFnZSI6Ii4vcnVudGltZS9yZXNvdXJjZXMvc21hbGxfc2NyZWVuLnBuZyJ9LCJib290U2NyZWVuIjp7ImFjdGl2ZSI6dHJ1ZSwid2FpdFNvdW5kcyI6MCwiY2xpY2tTb3VuZHMiOmZhbHNlfSwic3ByaXRlcyI6eyJjb2xsaXNpb25Cb3hlZCI6ZmFsc2UsImNvbGxpc2lvblByZWNpc2lvbiI6MSwiY29sbGlzaW9uQWxwaGFUaHJlc2hvbGQiOjF9LCJyYWluYm93cyI6eyJtb2RlIjoic2xvdyJ9LCJmb250cyI6eyJsaXN0Rm9udHMiOiJQQyIsImFtaWdhIjpbXSwiZ29vZ2xlIjpbInJvYm90byJdfSwic291bmRzIjp7Im1vZGUiOiJQQyIsInZvbHVtZSI6MSwicHJlbG9hZCI6dHJ1ZSwibnVtYmVyT2ZTb3VuZHNUb1ByZWxvYWQiOjMyLCJzb3VuZFBvb2xTaXplIjozMn0sImdhbWVwYWQiOnsibWFwcGluZyI6eyJ1cCI6IkFycm93VXAiLCJkb3duIjoiQXJyb3dEb3duIiwibGVmdCI6IkFycm93TGVmdCIsInJpZ2h0IjoiQXJyb3dSaWdodCIsImZpcmUiOiJTcGFjZSJ9fSwiZmlsZVN5c3RlbSI6eyJjYXNlU2Vuc2l0aXZlIjpmYWxzZX0sImRlZmF1bHQiOnsic2NyZWVuIjp7IngiOjAsInkiOjAsIndpZHRoIjoxMjgwLCJoZWlnaHQiOjcyMCwibnVtYmVyT2ZDb2xvcnMiOjMyLCJwaXhlbE1vZGUiOiJsb3dyZXMiLCJwYWxldHRlIjpbIiMwMDAwMDAiLCIjRkZGRkZGIiwiIzAwMDAwMCIsIiMyMjIyMjIiLCIjRkYwMDAwIiwiIzAwRkYwMCIsIiMwMDAwRkYiLCIjNjY2NjY2IiwiIzU1NTU1NSIsIiMzMzMzMzMiLCIjNzczMzMzIiwiIzMzNzczMyIsIiM3Nzc3MzMiLCIjMzMzMzc3IiwiIzc3MzM3NyIsIiMzMzc3NzciLCIjMDAwMDAwIiwiI0VFQ0M4OCIsIiNDQzY2MDAiLCIjRUVBQTAwIiwiIzIyNzdGRiIsIiM0NDk5REQiLCIjNTVBQUVFIiwiI0FBRERGRiIsIiNCQkRERkYiLCIjQ0NFRUZGIiwiI0ZGRkZGRiIsIiM0NDAwODgiLCIjQUEwMEVFIiwiI0VFMDBFRSIsIiNFRTAwODgiLCIjRUVFRUVFIl0sIndpbmRvdyI6eyJ4IjowLCJ5IjowLCJmb250V2lkdGgiOjE2LCJmb250SGVpZ2h0IjozMCwiYm9yZGVyIjowLCJwYXBlciI6MCwicGVuIjoxLCJiYWNrZ3JvdW5kIjoib3BhcXVlIiwiZm9udCI6eyJuYW1lIjoiSUJNIFBsZXggTW9ubyIsInR5cGUiOiJnb29nbGUiLCJoZWlnaHQiOjI2LjY1fSwiY3Vyc29yT24iOmZhbHNlLCJjdXJzb3JJbWFnZSI6Ii4vcnVudGltZS9yZXNvdXJjZXMvY3Vyc29yX3BjLnBuZyIsImN1cnNvckNvbG9ycyI6W3siciI6NjgsImciOjY4LCJiIjowLCJhIjoxMjh9LHsiciI6MTM2LCJnIjoxMzYsImIiOjAsImEiOjEyOH0seyJyIjoxODcsImciOjE4NywiYiI6MCwiYSI6MTI4fSx7InIiOjIyMSwiZyI6MjIxLCJiIjowLCJhIjoxMjh9LHsiciI6MjM4LCJnIjoyMzgsImIiOjAsImEiOjEyOH0seyJyIjoyNTUsImciOjI1NSwiYiI6MzQsImEiOjEyOH0seyJyIjoyNTUsImciOjI1NSwiYiI6MTM2LCJhIjoxMjh9LHsiciI6MjU1LCJnIjoyNTUsImIiOjIwNCwiYSI6MTI4fSx7InIiOjI1NSwiZyI6MjU1LCJiIjoyNTUsImEiOjEyOH0seyJyIjoxNzAsImciOjE3MCwiYiI6MjU1LCJhIjoxMjh9LHsiciI6MTM2LCJnIjoxMzYsImIiOjIwNCwiYSI6MTI4fSx7InIiOjEwMiwiZyI6MTAyLCJiIjoxNzAsImEiOjEyOH0seyJyIjozNCwiZyI6MzQsImIiOjEwMiwiYSI6MTI4fSx7InIiOjAsImciOjAsImIiOjY4LCJhIjoxMjh9LHsiciI6MCwiZyI6MCwiYiI6MTcsImEiOjEyOH0seyJyIjowLCJnIjowLCJiIjowLCJhIjoxMjh9XX19fX0='));
	this.aoz=new AOZ(canvasId,this.manifest);
	this.aoz.sources=JSON.parse(atob('W3sicGF0aCI6IkM6L1VzZXJzL0PpZHJpYy9Eb2N1bWVudHMvTXkgQU9aIEFwcGxpY2F0aW9ucy9NeUZpcnN0QXBwbGljYXRpb24vbWFpbi5hb3oifV0='));
	this.aoz.localTags=JSON.parse(atob('e30='));
	this.aoz.globalTags=JSON.parse(atob('e30='));
	this.aoz.developerMode=false;
	this.vars = ( typeof args == 'undefined' ? {} : args );	
	this.procParam$='';
	this.procParam=0;

	// Compiled program begins here
	// ----------------------------
	this.vars.nom$="";
	this.vars.age$="";
	this.blocks=[];
	this.blocks[0]=function(aoz,vars)
	{
		// Print "Hello World!" // Click on Run
		aoz.sourcePos="0:0:0";
		aoz.currentScreen.currentTextWindow.print("Hello World!",true);
		// Locate 5,1
		aoz.sourcePos="0:1:0";
		this.aoz.currentScreen.currentTextWindow.locate({x:5,y:1});
		// Print "you"
		aoz.sourcePos="0:2:0";
		aoz.currentScreen.currentTextWindow.print("you",true);
		// Input "Quel est ton nom ?";nom$
		aoz.sourcePos="0:3:0";
		return{type:8,instruction:"input",args:{text:"Quel est ton nom ?",variables:[{name:"nom$",type:2}],newLine:true}};
	};
	this.blocks[1]=function(aoz,vars)
	{
		// Input "Et ton age?" ;age$
		aoz.sourcePos="0:4:0";
		return{type:8,instruction:"input",args:{text:"Et ton age?",variables:[{name:"age$",type:2}],newLine:true}};
	};
	this.blocks[2]=function(aoz,vars)
	{
		// Print "Bonjour "+nom$+" !!!"+" Tu as "+age$+" ans"
		aoz.sourcePos="0:6:0";
		aoz.currentScreen.currentTextWindow.print("Bonjour "+vars.nom$+" !!!"+" Tu as "+vars.age$+" ans",true);
		// End
		aoz.sourcePos="0:8:0";
		return{type:16}
	};
	this.blocks[3]=function(aoz,vars)
	{
		return{type:0}
	};
	this.blocks[4]=function(aoz,vars)
	{
		return{type:0}
	};
	this.aoz.run(this,0,args);
	this.aoz.v1_0_textwindows=new v1_0_textwindows(this.aoz,args);
};
