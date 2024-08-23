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
		
		var instance = declare("_battle", null, {
			//put your functions here
			
			isAttacker : function()
			{
				return (this.player_id == this.attacking_player_id || this.player_id == this.preview_attacking_player_id);
			},
			
			isDefender : function()
			{
				return (this.player_id == this.defending_player_id || this.player_id == this.preview_defending_player_id);
			},
			
			isParticipant : function()
			{
				if(this.isAttacker())
				{
					return true;
				}
				if(this.isDefender())
				{
					return true;
				}
				if(this.player_id == this.preview_attacking_player_id)
				{
					return true;
				}
				else if(this.player_id == this.preview_defending_player_id)
				{
					return true;
				}
				return false;
			},
			
			isProvinceBattlePending : function(check_province_id)
			{
				for(cur_province_id in this.gamedatas.pending_battles)
				{
					if(cur_province_id == check_province_id)
					{
						return true;
					}
				}
				return false;
			},
			
			getDefenderPlayerId : function(pending_battle_prov_name)
			{
				//note: the client just defers to what the server tells them so this function is redundant
				//ill leave it in anyway for testing etc
				if(this.isProvinceBattlePending(pending_battle_prov_name))
				{
					var defender_faction_id = -1;
					var defender_player_id = -1;
					var armies = this.gamedatas.pending_battles[pending_battle_prov_name].armies;
					for(var army_id in armies)
					{
						var check_army_info = armies[army_id];
						//active player is always the aggressor
						if(check_army_info.player_id == this.getActivePlayerId())
						{
							continue;
						}
						var cur_faction_id = this.getPlayerFactionId(check_army_info.player_id);
						if(cur_faction_id > defender_faction_id)
						{
							defender_faction_id = cur_faction_id;
							defender_player_id = check_army_info.player_id;
						}
					}
					return defender_player_id;
				}
				return -1;
			},
			
		});
		
		return instance;
	}
);
