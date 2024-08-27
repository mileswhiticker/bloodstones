/*
 * ------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * bloodstones implementation : © Miles Whiticker <miles.whiticker@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */
 
define(
	[
		"dojo",
		"dojo/_base/declare"
	],
	function (dojo, declare){
		
		var instance = declare("_capture_enterexit", null, {
			
			//note: these functions are only intended to be used for chaos horde capture action during their playerMain state
			//it might make sense to integrate the functionality with the "playerCapture" state but we'll see how i go
			EnterCapturePhase : function()
			{
				console.log("page::EnterCapturePhase()");
			},
			
			ExitCapturePhase : function(approved)
			{
				console.log("page::ExitCapturePhase(" + approved + ")");
			},
			
		});
		
		return instance;
	}
);