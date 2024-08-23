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
		
		var instance = declare("_battle_ui", null, {
			//put your functions here
			
			CreateBattleTileStack : function(is_attacker)
			{
				//var parent_id = "battlewindow";
				//var container_id = "battletiles_" + battle_tile_class;
				
				//let container_node = dojo.place("<div id=\"" + container_id + "\" class=\"battle_tiles\"></div>", parent_id);
				var battle_tile_stack = new modules.TileStack();
				//this.current_player_paystack.createAsPaystack(this, container_id, this.getActivePlayerId(), paystack_node_id);
				//createAsBattleTiles: function(page, host_div_id, player_id, layout_as_attacker = false)
				battle_tile_stack.createAsBattleTiles(this, "battlewindow", this.getActivePlayerId(), is_attacker);
				
				return battle_tile_stack;
				
			},
			
			CreateRejectTileStack : function(is_attacker)
			{
				var battle_tile_stack = new modules.TileStack();
				battle_tile_stack.createAsBattleTilesReject(this, "battlewindow", this.getActivePlayerId(), is_attacker);
				
				return battle_tile_stack;
			},
			
			CreateTempTileStack : function(is_attacker)
			{
				var battle_tile_stack = new modules.TileStack();
				battle_tile_stack.createAsBattleTilesTemp(this, "battlewindow", this.getActivePlayerId(), is_attacker);
				
				return battle_tile_stack;
			},
			
			/*RejectTempSwapTileInfo : function (tile_info)
			{
				this.current_player_paystack.RemoveTileFromStack(tile_info.id);
				this.current_player_hand.SpawnTileInStack(tile_info, "paybucket_battle");
			},*/
			
			onClickPreviewBattle : function(event)
			{
				//console.log("page::onClickPreviewBattle()");
				//console.log(event);
				//console.log(event.target.id);
				//button_start_battle_inner_prov4
				
				var prov_name = event.target.id.substring(26);
				//console.log(prov_name);
				this.is_previewing_battle = true;
				gameui.PreviewBattle(prov_name);
			},
			
			onClickProceedBattle : function(event)
			{
				gameui.TryProceedCurrentBattle();
			},
			
			onClickWithdrawBattle : function(event)
			{
				gameui.TryWithdrawCurrentBattle();
			},
			
			addBattlescore : function(new_amount, battling_player_id)
			{
				if(battling_player_id == this.preview_attacking_player_id)
				{
					this.addBattlescoreAttacker(new_amount);
				}
				else if(battling_player_id == this.preview_defending_player_id)
				{
					this.addBattlescoreDefender(new_amount);
				}
				else
				{
					console.log("ERROR: addBattlescore(" + new_amount + "," + battling_player_id + ") for non battling player, attacking_player_id: " + this.gamedatas.attacking_player_id + " defending_player_id: " + this.gamedatas.attacking_player_id);
				}
			},
			
			addBattlescoreAttacker : function(new_amount)
			{
				this.battle_score_attacker += new_amount;
				var score_node = dojo.byId("battle_score_attacker");
				if(score_node != null)
				{
					score_node.innerHTML = _("Attacker score: ") + this.battle_score_attacker;
				}
			},
			
			addBattlescoreDefender : function(new_amount)
			{
				this.battle_score_defender += new_amount;
				var score_node = dojo.byId("battle_score_defender");
				if(score_node != null)
				{
					score_node.innerHTML = _("Defender score: ") + this.battle_score_defender;
				}
			},
		});
		
		return instance;
	}
);
