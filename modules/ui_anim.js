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
				console.log("page::StartAnimatedCanvas() render_function:" + render_function);
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
				console.log("page::StartAnimatedCanvas() this.canvas_render_function" + this.canvas_render_function);
				window.cancelAnimationFrame(this.canvas_anim_cancel_frame);
				this.canvas_render_function = null;
			},
			
			blstAnimFrame : function(prev_frame_time)
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
				
				if(window.gameui.pulsing_province_id != null || window.gameui.all_pulsing_provinces.length > 0)
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
					if(window.gameui.canvas_render_function != null)
					{
						window.gameui.canvas_render_function();
					}
					else
					{
						//this is still triggering, which means StopAnimatedCanvas() isn't functioning correctly
						//i'll need to look into it at some point but it's not a real problem
						//todo: rewrite the "pulsing" system to use css animations instead of window animation frames, the code will be much shorter and cleaner
						//window.gameui.previous_canvas_render_function
						console.log("WARNING: page::blstAnimFrame(" + prev_frame_time + ") called with null canvas_render_function (instance 1)");
					}
				}
				else if(window.gameui.pulsing_province_time != window.gameui.pulsing_province_default)
				{
					window.gameui.pulsing_province_time = window.gameui.pulsing_province_default;
					window.gameui.pulsing_province_dir = 1;
					window.gameui.ClearCanvas();
					if(window.gameui.canvas_render_function != null)
					{
						window.gameui.canvas_render_function();
					}
					else
					{
						console.log("ERROR: page::blstAnimFrame(" + prev_frame_time + ") called with null canvas_render_function (instance 2)");
					}
				}
				
				window.gameui.build_mode_cancel_anim = window.requestAnimationFrame(window.gameui.blstAnimFrame);
			},
			
		});
		
		return instance;
	}
);