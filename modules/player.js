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
				return this.isCurrentPlayerActiveState("citadelPlacement")
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
				return (this.isCurrentPlayerActive() && this.current_phase_id == STATE_MAIN_RESET);
			},
			
			isCurrentPlayerCaptureMode : function()
			{
				//only chaos horde can do this
				return (this.isCurrentPlayerMainState() && this.current_phase_id == STATE_MAIN_CAPTURE);
			},
			
			isCurrentPlayerBuildMode : function()
			{
				return (this.isCurrentPlayerActive() && this.current_phase_id == STATE_MAIN_BUILD) || this.isCurrentPlayerActiveState("freeBuild") || this.isCurrentPlayerActiveState("freeBuild_chaosHorde");
			},
			
			isCurrentPlayerFreeBuildMode : function()
			{
				return this.isCurrentPlayerActiveState("freeBuild") || this.isCurrentPlayerActiveState("freeBuild_chaosHorde");
			},
			
			isCurrentPlayerMoveMode : function()
			{
				return (this.isCurrentPlayerActive() && this.current_phase_id == STATE_MAIN_MOVE);
			},
			
			isCurrentPlayerBattleMode : function()
			{
				return (this.isCurrentPlayerActive() && this.current_phase_id == STATE_MAIN_BATTLE);
			},
			
		});
			
		return instance;
	}
);
