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
				//var newTime = gameui.date.getTime();
				var deltaTime = 0;
				deltaTime = (prev_frame_time - gameui.prev_frame_timestamp);
				//console.log(gameui.prev_frame_timestamp);
				gameui.prev_frame_timestamp = prev_frame_time;
				if(deltaTime > 60)
				{
					//deltaTime = 60;
				}
				//console.log(deltaTime);
				
				if(gameui.pulsing_province_id != null)
				{
					gameui.pulsing_province_time += deltaTime * gameui.pulsing_province_dir / 1000;
					if(gameui.pulsing_province_time >= gameui.pulsing_province_time_max)
					{
						gameui.pulsing_province_dir *= -1;
						gameui.pulsing_province_time = gameui.pulsing_province_time_max;
					}
					else if(gameui.pulsing_province_time < 0)
					{
						gameui.pulsing_province_dir *= -1;
						gameui.pulsing_province_time = 0;
					}
					
					//console.log(gameui.pulsing_province_time);
					gameui.ClearCanvas();
					gameui.AddBuildModeUI();
					//gameui.pulsing_province_id
				}
				else if(gameui.pulsing_province_time != 0.4)
				{
					gameui.pulsing_province_time = 0.4;
					gameui.pulsing_province_dir = 1;
					gameui.ClearCanvas();
					gameui.AddBuildModeUI();
				}
				
				gameui.build_mode_cancel_anim = window.requestAnimationFrame(gameui.buildmodeAnimFrame);
			},
			
		});
			
		return instance;
	}
);
