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
		
		var instance = declare("_battle_enterexit", null, {
			//put your functions here
			
			EnterBattleMode : function()
			{
				if(this.gamedatas.pending_battles.length == 0)
				{
					this.showMessage(_('You have no battles pending.'), 'info');
				}
				else
				{
					//console.log("page::EnterBattleMode()");
					
					//update the ui
					this.enterSmallPhase(gameui.STATE_MAIN_BATTLE);
					this.CreatePendingBattleCircles();
					this.SetProvinceOverlayMode(this.OVERLAY_BATTLE_PREVIEW);
				}
			},
			
			ExitBattleMode : function()
			{
				//console.log("page::ExitBattleMode()");
				if(this.battle_preview_province_name == null)
				{
					this.DestroyPendingBattleCircles();
					this.enterSmallPhase(gameui.STATE_MAIN_DEFAULT);
					this.SetProvinceOverlayMode(this.OVERLAY_SELECT);
				}
				else
				{
					//this.TryCancelCurrentBattle();
					this.showMessage(_('You must finish your current battle first.'), 'error');
				}
			},
		});
		
		return instance;
	}
);
