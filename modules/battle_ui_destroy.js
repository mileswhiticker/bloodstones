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
		
		var instance = declare("_battle_ui_destroy", null, {
			//put your functions here
			
			DestroyBattleWindow : function()
			{
				dojo.destroy("battlewindow");
				this.preview_battle_province_name = null;
				this.preview_defending_player_id = 0;
				this.preview_attacking_player_id = 0;
			},
		});
		
		return instance;
	}
);
