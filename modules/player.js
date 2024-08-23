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
			
			isCurrentPlayerBuildVillages : function()
			{
				return this.isCurrentPlayerActiveState("playerVillages")
			},
			
			isCurrentPlayerMainPhase : function()
			{
				return this.isCurrentPlayerActiveState("playerMain")
			},
			
			isCurrentPlayerVillagesState : function()
			{
				return this.isCurrentPlayerActiveState("playerVillages")
			},
			
			isCurrentPlayerResetMode : function()
			{
				return (this.isCurrentPlayerActive() && this.current_phase_id == PHASE_RESET);
			},
			
			isCurrentPlayerBuildMode : function()
			{
				return (this.isCurrentPlayerActive() && this.current_phase_id == PHASE_BUILD) || this.isCurrentPlayerActiveState("freeBuild");
			},
			
			isCurrentPlayerFreeBuildMode : function()
			{
				return this.isCurrentPlayerActiveState("freeBuild");
			},
			
			isCurrentPlayerMoveMode : function()
			{
				return (this.isCurrentPlayerActive() && this.current_phase_id == PHASE_MOVE);
			},
			
			isCurrentPlayerBattleMode : function()
			{
				return (this.isCurrentPlayerActive() && this.current_phase_id == PHASE_BATTLE);
			},
			
		});
			
		return instance;
	}
);
