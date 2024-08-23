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
		
		var instance = declare("_freebuild", null, {
			//put your functions here
			
			AddFreeBuildUI : function(gamedatas)
			{
				//reuse most of the code from build mode
				//see buildmode.js
				
				//reset these
				this.pulsing_province_time = 0;
				this.prev_frame_timestamp = 0;
				this.pulsing_province_dir = 1;
				
				//this.prev_frame_timestamp = this.date.getTime();
				this.build_mode_cancel_anim = window.requestAnimationFrame(this.buildmodeAnimFrame);
				this.AddBuildModeUI();
				this.EnablePaymentBucket(PHASE_BUILD);
				
				//5 free build points
				this.AddActionPaidAmount(5);
			},
		});
			
		return instance;
	}
);
