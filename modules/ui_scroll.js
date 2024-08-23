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
		
		var instance = declare("_ui_scroll", null, {
			//put your functions here

			ScrollGamewindowVertical : function(direction)
			{
				var scroll_amount = 50 * direction;
				const gamemap = dojo.byId("gamemap");
				var dojo_anim = fx.animateProperty({node:"gamemap",properties:{scrollTop: gamemap.scrollTop + scroll_amount}});
				dojo_anim.play();
			},
			
			ScrollGamewindowHorizontal : function(direction)
			{
				var scroll_amount = 50 * direction;
				const gamemap = dojo.byId("gamemap");
				var dojo_anim = fx.animateProperty({node:"gamemap",properties:{scrollLeft: gamemap.scrollLeft + scroll_amount}});
				dojo_anim.play();
			},
			
		});
		
		return instance;
	}
);