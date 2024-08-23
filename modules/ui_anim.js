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
		
		var instance = declare("_ui_anim", null, {
			//put your functions here
			
			StartAnimatedCanvas : function(render_function)
			{
				//console.log("page::StartAnimatedCanvas()");
				this.canvas_render_function = render_function;
				this.previous_canvas_render_function = render_function
				this.canvas_anim_cancel_frame = window.requestAnimationFrame(this.blstAnimFrame);
			},
			
			IsAnimatedCanvasRunning : function()
			{
				return this.canvas_render_function != null;
			},
			
			StopAnimatedCanvas : function()
			{
				window.cancelAnimationFrame(this.canvas_anim_cancel_frame);
				this.canvas_render_function = null;
			},
			
			blstAnimFrame : function(prev_frame_time)
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
				
				if(gameui.pulsing_province_id != null || gameui.all_pulsing_provinces.length > 0)
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
					if(gameui.canvas_render_function != null)
					{
						gameui.canvas_render_function();
					}
					else
					{
						//this is still triggering, which means StopAnimatedCanvas() isn't functioning correctly
						//i'll need to look into it at some point but it's not a real problem
						//todo: rewrite the "pulsing" system to use css animations instead of window animation frames, the code will be much shorter and cleaner
						//gameui.previous_canvas_render_function
						console.log("WARNING: page::blstAnimFrame(" + prev_frame_time + ") called with null canvas_render_function (1)");
					}
				}
				else if(gameui.pulsing_province_time != gameui.pulsing_province_default)
				{
					gameui.pulsing_province_time = gameui.pulsing_province_default;
					gameui.pulsing_province_dir = 1;
					gameui.ClearCanvas();
					if(gameui.canvas_render_function != null)
					{
						gameui.canvas_render_function();
					}
					else
					{
						console.log("ERROR: page::blstAnimFrame(" + prev_frame_time + ") called with null canvas_render_function (2)");
					}
				}
				
				gameui.build_mode_cancel_anim = window.requestAnimationFrame(gameui.blstAnimFrame);
			},
			
		});
		
		return instance;
	}
);