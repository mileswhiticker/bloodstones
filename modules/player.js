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
		
		var instance = declare("_player", null, {
			//put your functions here
			
			isCurrentPlayerActiveState : function(statename)
			{
				return (this.isCurrentPlayerActive() && this.gamedatas.gamestate.name == statename);
			},
			
			isCurrentPlayerCitadelState : function()
			{
				var result = this.isCurrentPlayerActiveState("citadelPlacement");
				//console.log("page::isCurrentPlayerCitadelState() " + result);
				return result;
			},
			
			isCurrentPlayerCaptureState : function()
			{
				return this.isCurrentPlayerActiveState("playerCapture")
			},
			
			isCurrentPlayerUndeadState : function()
			{
				return this.isCurrentPlayerActiveState("playerUndead")
			},
			
			isCurrentPlayerRetreatState : function()
			{
				return this.isCurrentPlayerActiveState("retreat")
			},
			
			isCurrentPlayerWithdrawState : function()
			{
				return this.isCurrentPlayerActiveState("chooseWithdraw")
			},
			
			isCurrentPlayerVillagesState : function()
			{
				return this.isCurrentPlayerActiveState("playerVillages")
			},
			
			isCurrentPlayerMainState : function()
			{
				return this.isCurrentPlayerActiveState("playerMain")
			},
			
			isCurrentPlayerResetMode : function()
			{
				return (this.isCurrentPlayerActive() && this.current_phase_id == gameui.STATE_MAIN_RESET);
			},
			
			isCurrentPlayerCaptureMode : function()
			{
				//only chaos horde can do this
				return (this.isCurrentPlayerMainState() && this.current_phase_id == gameui.STATE_MAIN_CAPTURE);
			},
			
			isCurrentPlayerBuildMode : function()
			{
				return (this.isCurrentPlayerActive() && this.current_phase_id == gameui.STATE_MAIN_BUILD) || this.isCurrentPlayerActiveState("freeBuild") || this.isCurrentPlayerActiveState("freeBuild_chaosHorde");
			},
			
			isCurrentPlayerFreeBuildMode : function()
			{
				return this.isCurrentPlayerActiveState("freeBuild") || this.isCurrentPlayerActiveState("freeBuild_chaosHorde");
			},
			
			isCurrentPlayerMoveMode : function()
			{
				var is_active = this.isCurrentPlayerActive();
				//console.log("page::isCurrentPlayerMoveMode() is_active:" + is_active + " | this.current_phase_id:" + this.current_phase_id + " | gameui.STATE_MAIN_MOVE:" + gameui.STATE_MAIN_MOVE);
				return (this.isCurrentPlayerActive() && this.current_phase_id == gameui.STATE_MAIN_MOVE);
			},
			
			isCurrentPlayerBattleMode : function()
			{
				return (this.isCurrentPlayerActive() && this.current_phase_id == gameui.STATE_MAIN_BATTLE);
			},
			
			getCurrentPlayerInfo()
			{
				var current_player_id = this.getCurrentPlayerId();
				return this.gamedatas.players[current_player_id];
			},
			
		});
			
		return instance;
	}
);
