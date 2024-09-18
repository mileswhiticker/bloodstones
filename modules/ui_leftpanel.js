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
		
		var instance = declare("_ui_leftpanel", null, {
			//put your functions here
			
			SetupLeftUI : function(gamedatas)
			{
				//console.log("page::SetupLeftUI()");
				this.SetupPlayercards(gamedatas);
				
				//add a hint telling the player they can select an army there
				this.CreateArmySelectPanelTitle();
			},
			
			CreatePlayerHand : function(hand_player_id)
			{
				//ui element to show the tiles in a player's hand
				this.current_player_hand = new modules.TileStack();
				this.current_player_hand.createAsPlayerHand(this,"gamemap", hand_player_id);
				
				var playercard = dojo.byId(this.GetPlayercardDivId(hand_player_id));
				var playercard_grid = playercard.firstChild;
				playercard_grid.appendChild(this.current_player_hand.container_div,true);
				
				return this.current_player_hand;
			},
			
			//onClickStackTileUI : function(event)
			onClickArmySelectedTile : function(event)
			{
				//this is untested with the new system but might not work
				//console.log("page::onClickArmySelectedTile()");
				//console.log(event);
				
				if(window.gameui.selected_army == null)
				{
					console.log("ERROR: Trying to select tile while selected_army is null");
					return;
				}
				
				var selected_div = $(event.target.id);
				//var cur_tile_id = this.GetTileIdFromImage(event.target.id);
				var cur_tile_id = this.GetArmySelectedTileId(event.target.id);
				//console.log(event.target.id);
				//console.log(cur_tile_id);
				//console.log(window.gameui.selected_army.tiles);
				
				//only active players in move mode can split off tiles
				//todo: better merge move mode and undead mode functionality here
				if(this.isCurrentPlayerMoveMode())
				{
					//we can't split off a tile if this is the last one
					if(window.gameui.selected_army.items.length <= 1)
					{
						return;
					}
					
					//split off this tile into a new stack
					this.ui_busy = true;
					
					//check if this army has already moved
					if(this.queued_moving_armies.includes(window.gameui.selected_army))
					{
						//visual helper animation from the player's hand to the army stack on the map
						this.SelectedArmySplitAnimation(cur_tile_id, window.gameui.selected_army.id_num);
						
						//we have already started moving, so record this split as a new action
						var temp_army_info = {army_id: this.getTempArmyId(), player_id: window.gameui.selected_army.player_id, prov_name: window.gameui.selected_army.prov_name, tiles: []};
						var temp_army = this.CreateArmy(temp_army_info, null);
						this.TransferArmyTiles(window.gameui.selected_army.id_num, temp_army.id_num, [cur_tile_id], this.SELECT_ARMY_SOURCE);
						this.QueueArmySplit(window.gameui.selected_army, [cur_tile_id], temp_army);
					}
					else
					{
						//we havent started moving so execute this split immediately
						this.ServerArmySplit(window.gameui.selected_army, [cur_tile_id]);
						
						//visual helper animation from the player's hand to the army stack on the map
						this.SelectedArmySplitAnimation(cur_tile_id, window.gameui.selected_army.id_num);
					}
					this.ui_busy = false;
				}
				else if(this.isCurrentPlayerUndeadState())
				{
					//this is almost entirely duplicate code but it's easy and simple enough that the tech debt is minimal
					
					//we can't split off a tile if this is the last one
					if(window.gameui.selected_army.items.length <= 1)
					{
						return;
					}
					
					//split off this tile into a new stack
					this.ui_busy = true;
					
					//check if this army has already moved
					if(this.queued_undead_moves[window.gameui.selected_army.id_string])
					{
						this.showMessage(this.GetSplitFailMoveString(), 'error');
					}
					else
					{
						//we havent started moving so execute this split immediately
						this.ServerArmySplit(window.gameui.selected_army, [cur_tile_id]);
						
						//visual helper animation from the player's hand to the army stack on the map
						this.SelectedArmySplitAnimation(cur_tile_id, window.gameui.selected_army.id_num);
					}
					this.ui_busy = false;
				}
				
				/*
				//toggle selection of this tile
				var clicked_tile = window.gameui.selected_army.tiles[cur_tile_id];
				//console.log(clicked_tile);
				if(clicked_tile.selected == 1)
				{
					clicked_tile.selected = 0;
				}
				else
				{
					clicked_tile.selected = 1;
				}
				//console.log(clicked_tile.selected);
				selected_div.style.opacity = clicked_tile.selected;
				//console.log(selected_div);
				
				this.TileSelectionUpdated();
				*/
			},
			
			lockArmyTileSelection : function()
			{
				if(window.gameui.selected_army != null)
				{
					//first, make all tiles in the army selected
					//domClass.contains("someNode", "aSillyClassName"))
					
					//console.log(window.gameui.selected_army.tiles);
					for(var i in window.gameui.selected_army.tiles)
					{
						//console.log(i);
						var cur_tile = window.gameui.selected_army.tiles["" + i];
						//console.log(cur_tile);
						var cur_tile_div = $("selected_army_uitile_" + cur_tile.id);
						//console.log(cur_tile_div);
						
						dojo.addClass(cur_tile_div,"ui_stack_tile_disabled");
						/*
						cur_tile.selected = 1;
						//console.log(cur_tile.selected);
						var selected_div = $("selected_tile_" + cur_tile.id)
						selected_div.style.opacity = cur_tile.selected;
						*/
					}
				}
				else
				{
					//sanity check
					console.log("ERROR: lockArmyTileSelection() but selected_army == null");
				}
			},
			
			unlockArmyTileSelection : function()
			{
				if(window.gameui.selected_army != null)
				{
					//first, make all tiles in the army selected
					//domClass.contains("someNode", "aSillyClassName"))
					
					//console.log(window.gameui.selected_army.tiles);
					for(var i in window.gameui.selected_army.tiles)
					{
						//console.log(i);
						var cur_tile = window.gameui.selected_army.tiles["" + i];
						//console.log(cur_tile);
						var cur_tile_div = $("selected_army_uitile_" + cur_tile.id);
						//console.log(cur_tile_div);
						
						dojo.removeClass(cur_tile_div,"ui_stack_tile_disabled");
					}
				}
				else
				{
					//sanity check
					console.log("ERROR: unlockArmyTileSelection() but selected_army == null");
				}
			}
		});
		
		return instance;
	},
);