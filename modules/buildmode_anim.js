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
		
		var instance = declare("_buildmode_anim", null, {
			//put your functions here
			
			buildmodeAnimFrame : function(prev_frame_time)
			{
				//update the time since last draw call
				//console.log(this);
				//var newTime = window.gameui.date.getTime();
				var deltaTime = 0;
				deltaTime = (prev_frame_time - window.gameui.prev_frame_timestamp);
				//console.log(window.gameui.prev_frame_timestamp);
				window.gameui.prev_frame_timestamp = prev_frame_time;
				if(deltaTime > 60)
				{
					//deltaTime = 60;
				}
				//console.log(deltaTime);
				
				if(window.gameui.pulsing_province_id != null)
				{
					window.gameui.pulsing_province_time += deltaTime * window.gameui.pulsing_province_dir / 1000;
					if(window.gameui.pulsing_province_time >= window.gameui.pulsing_province_time_max)
					{
						window.gameui.pulsing_province_dir *= -1;
						window.gameui.pulsing_province_time = window.gameui.pulsing_province_time_max;
					}
					else if(window.gameui.pulsing_province_time < 0)
					{
						window.gameui.pulsing_province_dir *= -1;
						window.gameui.pulsing_province_time = 0;
					}
					
					//console.log(window.gameui.pulsing_province_time);
					window.gameui.ClearCanvas();
					window.gameui.AddBuildModeUI();
					//window.gameui.pulsing_province_id
				}
				else if(window.gameui.pulsing_province_time != 0.4)
				{
					window.gameui.pulsing_province_time = 0.4;
					window.gameui.pulsing_province_dir = 1;
					window.gameui.ClearCanvas();
					window.gameui.AddBuildModeUI();
				}
				
				window.gameui.build_mode_cancel_anim = window.requestAnimationFrame(window.gameui.buildmodeAnimFrame);
			},
			
		});
			
		return instance;
	}
);
