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
		
		var instance = declare("_ui_playercards", null, {
			//put your functions here
			
			SetupPlayercards : function()
			{
				//setup the drag event calls
				//todo: are these still needed?
				this.callback_HandTileDragStart = this.HandTileDragStart;
				this.callback_HandTileDragEnd = this.HandTileDragEnd;
				this.callback_HandTileDrop = this.HandTileDrop;
				
				//only setup the current player's UI on the left now, the other info has moved to the right panel player boards
				if(!this.isSpectator)
				{
					var current_player_id = this.getCurrentPlayer();
					this.SetupPlayercard(current_player_id);
				}
			},
			
			SetupPlayerboards : function()
			{
				for(var player_id in this.gamedatas.players)
				{
					//this.SetupPlayercard(player_id);
					this.SetupPlayerboard(player_id);
				}
			},
			
			SetupPlayerboard : function(player_id)
			{
				//this player board goes on the far right floating panel
				//console.log("page::SetupPlayerboard(" + player_id + ")");
				const overall_player_board = dojo.byId("overall_player_board_" + player_id);
				const player_name = dojo.byId("player_name_" + player_id);
				const player_board = dojo.byId("player_board_" + player_id);
				const player_board_content = dojo.place("<div class=\"playerboard_bloodstones_content\"></div>",player_board);
				
				//grab some useful info
				var player = this.gamedatas.players[player_id];
				var factionid = player.factionid;
				
				//background image
				dojo.addClass(overall_player_board,'playercard_' + factionid);
				
				//white background highlight for player name
				dojo.style(player_name, "background-color", "white");
				
				//player faction name
				var faction_color_css = "faction" + factionid + "_color";
				let faction_name = dojo.place("<div>" + this.faction_strings[factionid].title + "</div>",player_board_content);
				dojo.addClass(faction_name,faction_color_css);
				dojo.addClass(faction_name,'playerboard_faction_name');
				dojo.addClass(faction_name,'grid11');
				
				//make some tweaks to the default bga playerboard on the right panel
				let playerboard_score = dojo.byId(this.GetPlayerboardScoreDivId(player_id));
				dojo.addClass(playerboard_score,faction_color_css);
				//todo: change star icon to bloodstones victory points icon
				
				//player regroup counter
				let player_regroups_container = dojo.place("<div id=\"" + this.GetPlayerboardRegroupsDivId(player_id) + "\">" + player.regroups + "</div>", player_board_content);
				dojo.addClass(player_regroups_container,'playerboard_container');
				dojo.addClass(player_regroups_container,'regroup' + factionid);
				dojo.addClass(player_regroups_container,faction_color_css);
				dojo.addClass(player_regroups_container,'grid12');
				
				//villages not yet built from this player
				let player_villages_container = dojo.place("<div id=\"" + this.GetVillagesAvailablePlayerboardTextDivId(player_id) + "\">" + player.villages_available + "</div>", player_board_content);
				dojo.addClass(player_villages_container,faction_color_css);
				dojo.addClass(player_villages_container,"playerboard_container");
				dojo.addClass(player_villages_container,'village' + factionid);
				dojo.addClass(player_villages_container,'grid13');
				
				//chaos horde cannot build villages
				if(factionid == this.FACTION_CHAOSHORDE)
				{
					dojo.addClass(player_villages_container,"display_none");
				}
				
				//citadels captured by this player
				let captured_citadels_container = dojo.place("<div id=\"" + this.GetCitadelsCapturedTextNodeId(player_id) + "\">" + player.captured_citadels + "</div>", player_board_content);
				dojo.addClass(captured_citadels_container,faction_color_css);
				dojo.addClass(captured_citadels_container,'playerboard_container');
				dojo.addClass(captured_citadels_container,'grid14');
				
				//dynamically generate an icon for the captured citadels
				var current_left_offset = 20;
				var num_enemy_citadels = 0;
				for(var captured_player_id in this.gamedatas.players)
				{
					//skip ourselves, we can't capture our own citadels!
					if(captured_player_id == player_id)
					{
						continue;
					}
					
					//grab info about this player
					var captured_player = this.gamedatas.players[captured_player_id];
					var captured_factionid = captured_player.factionid;
					
					//chaos horde cannot build citadels
					if(captured_factionid == this.FACTION_CHAOSHORDE)
					{
						continue;
					}
					
					num_enemy_citadels++;
					
					//create the div element to show a town for this player
					let player_captured_cit = dojo.place("<div></div>", captured_citadels_container);
					dojo.addClass(player_captured_cit,'playerboard_container');
					dojo.addClass(player_captured_cit,'playerboard_container_item');
					dojo.addClass(player_captured_cit, 'playerboard_container_item');
					dojo.addClass(player_captured_cit, 'citadel' + captured_factionid);
					dojo.style(player_captured_cit, "left", current_left_offset + "px");
					current_left_offset += 10;
				}
				
				//villages captured by this player
				let player_captured_villages_container = dojo.place("<div id=\"" + this.GetVillagesCapturedTextNodeId(player_id) + "\">" + player.villages_captured + "</div>", player_board_content);
				dojo.addClass(player_captured_villages_container,faction_color_css);
				dojo.addClass(player_captured_villages_container,'playerboard_container');
				dojo.addClass(player_captured_villages_container,'grid15');
				
				//dynamically generate an icon for the captured villages
				var current_left_offset = 20;
				var num_enemy_villages = 0;
				for(var captured_player_id in this.gamedatas.players)
				{
					//skip ourselves, we can't capture our own citadels!
					if(captured_player_id == player_id)
					{
						continue;
					}
					
					//grab info about this player
					var captured_player = this.gamedatas.players[captured_player_id];
					var captured_factionid = captured_player.factionid;
					
					//chaos horde cannot build citadels
					if(captured_factionid == this.FACTION_CHAOSHORDE)
					{
						continue;
					}
					
					num_enemy_villages++;
					
					//create the div element to show a town for this player
					let player_captured_village = dojo.place("<div></div>", player_captured_villages_container);
					dojo.addClass(player_captured_village,'playerboard_container');
					dojo.addClass(player_captured_village,'playerboard_container_item');
					dojo.addClass(player_captured_village, 'village' + captured_factionid);
					dojo.style(player_captured_village, "left", current_left_offset + "px");
					current_left_offset += 10;
				}
				
				//number of tiles in hand for this player
				let player_hidden_hand_tiles = dojo.place("<div id=\"" + this.GetPlayerHiddenHandDivId(player_id) + "\"></div>", player_board_content);
				dojo.addClass(player_hidden_hand_tiles,'playerboard_container');
				dojo.addClass(player_hidden_hand_tiles,faction_color_css);
				dojo.addClass(player_hidden_hand_tiles,'grid22');
				let player_hidden_hand_text = dojo.place("<div id=\"" + this.GetPlayerHiddenHandTextDivId(player_id) + "\">" + player.tiles_hand + "</div>", player_hidden_hand_tiles);
				dojo.addClass(player_hidden_hand_text,"playerboard_container_item");
				//
				//create an icon for the player tile
				var current_left_offset = 20;
				var player_tile = dojo.place("<div>hand</div>", player_hidden_hand_tiles);
				dojo.addClass(player_tile,'playerboard_container');
				dojo.addClass(player_tile,'playerboard_container_item_long');
				dojo.addClass(player_tile,'playerboard_smalltext');
				dojo.addClass(player_tile,'blanktile' + factionid);
				dojo.style(player_tile, "left", current_left_offset + "px");
				
				
				//number of tiles in bag for this player
				let player_hidden_bag_tiles = dojo.place("<div id=\"" + this.GetPlayerHiddenBagDivId(player_id) + "\"></div>", player_board_content);
				dojo.addClass(player_hidden_bag_tiles,'playerboard_container');
				dojo.addClass(player_hidden_bag_tiles,faction_color_css);
				dojo.addClass(player_hidden_bag_tiles,'grid23');
				let player_hidden_bag_text = dojo.place("<div id=\"" + this.GetPlayerHiddenBagTextDivId(player_id) + "\">" + player.tiles_bag + "</div>", player_hidden_bag_tiles);
				dojo.addClass(player_hidden_bag_text,"playerboard_container_item");
				//
				//create an icon for the player tile
				var current_left_offset = 20;
				var player_tile = dojo.place("<div>bag</div>", player_hidden_bag_tiles);
				dojo.addClass(player_tile,'playerboard_container');
				dojo.addClass(player_tile,'playerboard_container_item_long');
				dojo.addClass(player_tile,'playerboard_smalltext');
				dojo.addClass(player_tile,'blanktile' + factionid);
				dojo.style(player_tile, "left", current_left_offset + "px");
				
				
				//number of tiles in discard for this player
				let player_hidden_discard_tiles = dojo.place("<div id=\"" + this.GetPlayerHiddenDiscardDivId(player_id) + "\"></div>", player_board_content);
				dojo.addClass(player_hidden_discard_tiles,'playerboard_container');
				dojo.addClass(player_hidden_discard_tiles,faction_color_css);
				dojo.addClass(player_hidden_discard_tiles,'grid24');
				let player_hidden_discard_text = dojo.place("<div id=\"" + this.GetPlayerHiddenDiscardTextDivId(player_id) + "\">" + player.tiles_discard + "</div>", player_hidden_discard_tiles);
				dojo.addClass(player_hidden_discard_text,"playerboard_container_item");
				//
				//create an icon for the player tile
				var current_left_offset = 20;
				var player_tile = dojo.place("<div>disc</div>", player_hidden_discard_tiles);
				dojo.addClass(player_tile,'playerboard_container');
				dojo.addClass(player_tile,'playerboard_container_item_long');
				dojo.addClass(player_tile,'playerboard_smalltext');
				dojo.addClass(player_tile,'blanktile' + factionid);
				dojo.style(player_tile, "left", current_left_offset + "px");
			},
			
			SetupPlayercard : function(player_id)
			{
				//this playercard goes on the far left panel
				var player = this.gamedatas.players[player_id];
				var factionid = player.factionid;
				if(factionid < 0 || factionid >= this.faction_strings.length)
				{
					factionid = this.faction_strings.length - 1;
				}
				//console.log(player_id + " | " + player.factionid);
				//console.log(player);
				
				//the container div
				let playercard = document.createElement("div");
				playercard.id = this.GetPlayercardDivId(player_id);
				dojo.addClass(playercard,'playercard_' + factionid);
				dojo.addClass(playercard,'playercard');
				$('playercards').appendChild(playercard,true);
				
				//grid to hold all the display elements except for the player hand tiles
				let playercard_elements_grid = dojo.place("<div></div>", playercard.id);
				dojo.addClass(playercard_elements_grid,'playercard_elements_grid');
				
				//div to hold the top row of content for each player's info card
				let playercard_title = document.createElement("div");
				dojo.addClass(playercard_title,'playercard_title');
				playercard_elements_grid.appendChild(playercard_title,true);
				
				//faction name
				var faction_color_css = "faction" + factionid + "_color";
				let faction_name = document.createElement("div");
				faction_name.innerHTML = this.faction_strings[factionid].title;
				//faction_name.style.color = this.faction_strings[factionid].fontColour;
				dojo.addClass(faction_name,faction_color_css);
				dojo.addClass(faction_name,'playercard_faction_name');
				playercard_title.appendChild(faction_name,true);
				
				/*
				//player regroup counter
				let player_regroups_text = dojo.place("<div></div>", playercard_elements_grid);
				player_regroups_text.id = this.GetPlayercardRegroupsDivId(player_id);
				player_regroups_text.innerHTML = player.regroups;
				dojo.addClass(player_regroups_text,faction_color_css);
				dojo.addClass(player_regroups_text,'player_regroups_text');
				dojo.addClass(player_regroups_text,'playercard_text');
				
				let player_regroups_icon = dojo.place("<div></div>", playercard_elements_grid);
				dojo.addClass(player_regroups_icon,'regroup' + factionid);
				dojo.addClass(player_regroups_icon,'player_regroups_icon');
				dojo.addClass(player_regroups_icon,'playercard_icon');
				
				//player score counter (victory points)
				let player_score_text = dojo.place("<div></div>", playercard_elements_grid);
				dojo.addClass(player_score_text,player_score_text);
				player_score_text.id = this.GetPlayercardScoreDivId(player_id);
				player_score_text.innerHTML = player.score;
				dojo.addClass(player_score_text,faction_color_css);
				dojo.addClass(player_score_text,'player_score_text');
				dojo.addClass(player_score_text,'playercard_text');
				
				let player_score_icon = dojo.place("<div></div>", playercard_elements_grid);
				dojo.addClass(player_score_icon,'score' + factionid);
				dojo.addClass(player_score_icon,'player_score_icon');
				dojo.addClass(player_score_icon,'playercard_icon');
				
				//villages not yet built from this player
				let player_villages_text = dojo.place("<div></div>", playercard_elements_grid);
				player_villages_text.id = this.GetVillagesAvailablePlayercardTextDivId(player_id);
				player_villages_text.innerHTML = player.villages_available;
				dojo.addClass(player_villages_text,"player_villages_text");
				dojo.addClass(player_villages_text,faction_color_css);
				dojo.addClass(player_villages_text,"playercard_text");
				
				let player_villages_icon = dojo.place("<div></div>", playercard_elements_grid);
				player_villages_icon.id = this.GetPlayerVillagesDivId(player_id);
				dojo.addClass(player_villages_icon,"player_villages_icon");
				dojo.addClass(player_villages_icon,'village' + factionid);
				dojo.addClass(player_villages_icon,"playercard_icon");
				
				//chaos horde cannot build villages
				if(factionid == this.FACTION_CHAOSHORDE)
				{
					dojo.addClass(player_villages_text,"display_none");
					dojo.addClass(player_villages_icon,"display_none");
				}
				
				//captured citadels container
				let player_capcit_text = dojo.place("<div></div>", playercard_elements_grid);
				player_capcit_text.id = this.GetCitadelsCapturedTextNodeId(player_id);
				player_capcit_text.innerHTML = player.captured_citadels;
				dojo.addClass(player_capcit_text,"player_capcit_text");
				dojo.addClass(player_capcit_text,faction_color_css);
				dojo.addClass(player_capcit_text,"playercard_text");
				
				let player_capcit_icon = dojo.place("<div></div>", playercard_elements_grid);
				dojo.addClass(player_capcit_icon,"player_capcit_icon");
				dojo.addClass(player_capcit_icon,"playercard_icon");
				
				//dynamically generate an icon for the captured citadels
				var current_left_offset = 0;
				var num_enemy_citadels = 0;
				for(var captured_player_id in this.gamedatas.players)
				{
					//skip ourselves, we can't capture our own citadels!
					if(captured_player_id == player_id)
					{
						continue;
					}
					
					//grab info about this player
					var captured_player = this.gamedatas.players[captured_player_id];
					var captured_factionid = captured_player.factionid;
					
					//chaos horde cannot build citadels
					if(captured_factionid == this.FACTION_CHAOSHORDE)
					{
						continue;
					}
					
					num_enemy_citadels++;
					
					//create the div element to show a town for this player
					let player_captured_cit = dojo.place("<div></div>", player_capcit_icon);
					dojo.addClass(player_captured_cit, 'playercard_icon');
					dojo.addClass(player_captured_cit, 'citadel' + captured_factionid);
					dojo.style(player_captured_cit, "left", current_left_offset + "px");
					current_left_offset += 10;
				}
				
				//this should only occur if there are 2 players, and one is chaos horde (normally wont happen)
				if(num_enemy_citadels == 0)
				{
					dojo.addClass(player_capcit_text, 'display_none');
					dojo.addClass(player_capcit_icon, 'display_none');
				}
				
				
				
				//captured villages container
				let player_capvil_text = dojo.place("<div></div>", playercard_elements_grid);
				player_capvil_text.id = this.GetVillagesCapturedTextNodeId(player_id);
				player_capvil_text.innerHTML = player.villages_captured;
				dojo.addClass(player_capvil_text,"player_capvil_text");
				dojo.addClass(player_capvil_text,faction_color_css);
				dojo.addClass(player_capvil_text,"playercard_text");
				
				let player_capvil_icon = dojo.place("<div></div>", playercard_elements_grid);
				dojo.addClass(player_capvil_icon,"player_capvil_icon");
				dojo.addClass(player_capvil_icon,"playercard_icon");
				
				//dynamically generate an icon for the captured citadels
				current_left_offset = 0;
				var num_enemy_villages = 0;
				for(var captured_player_id in this.gamedatas.players)
				{
					//skip ourselves, we can't capture our own citadels!
					if(captured_player_id == player_id)
					{
						continue;
					}
					
					//grab info about this player
					var captured_player = this.gamedatas.players[captured_player_id];
					var captured_factionid = captured_player.factionid;
					
					//chaos horde cannot build citadels
					if(captured_factionid == this.FACTION_CHAOSHORDE)
					{
						continue;
					}
					
					num_enemy_villages++;
					
					//create the div element to show a town for this player
					let player_captured_vil = dojo.place("<div></div>", player_capvil_icon);
					dojo.addClass(player_captured_vil, 'playercard_icon');
					dojo.addClass(player_captured_vil, 'village' + captured_factionid);
					dojo.style(player_captured_vil, "left", current_left_offset + "px");
					current_left_offset += 10;
				}
				
				//this should only occur if there are 2 players, and one is chaos horde (normally wont happen)
				if(num_enemy_villages == 0)
				{
					dojo.addClass(player_capvil_text, 'display_none');
					dojo.addClass(player_capvil_icon, 'display_none');
				}
				*/
				
				//player name
				let player_name = document.createElement("div");
				player_name.innerHTML = player.name;
				//player_name.style.color = this.faction_strings[factionid].fontColour;
				dojo.addClass(player_name,faction_color_css);
				dojo.addClass(player_name, 'player_name');
				playercard.appendChild(player_name,true);
				
				//is this the info card for the current player?
				if(this.player_id == player_id)
				{
					//special handling for current player 
					/*
					//make the village icon draggable
					player_villages_icon.draggable = true;
					player_villages_icon.ondragstart = window.gameui.callback_HandTileDragStart;
					player_villages_icon.ondragend = window.gameui.callback_HandTileDragEnd;
					player_villages_icon.ondrop = window.gameui.callback_HandTileDrop;
					
					//here we do the private content that is only visible to the current player
					//there is more info so make this larger
					//playercard.style.height = "380px";
					
					//button for this player to end turn
					//todo: should we use the inbuilt bga methods for button creation?
					let end_turn_button = document.createElement("div");
					end_turn_button.id = "end_turn_button";
					playercard.appendChild(end_turn_button,true);
					dojo.connect(end_turn_button, "click", dojo.hitch(this, this.ServerSkipAction));
					
					this.DisableButton("end_turn_button");
					*/
					
					//the current player's tiles in hand
					let current_player_hand = this.CreatePlayerHand(player_id);
					//console.log(this.gamedatas.hand);
					
					//add all tiles to their hand
					this.CreatePlayerHandTiles();
				}
				else
				{
					//public content visible to all players
					playercard.style.height = "135px";
					
					//a container for this enemy player tiles
					let enemy_tiles = dojo.place("<div id=\"enemy_tiles_" + player.id + "\" class=\"enemy_tiles\"></div>", playercard_elements_grid);
					this.UpdateHiddenHandTiles(player.id, player.tiles_hand);
				}
			},
			
			HandTileDragStart : function(event)
			{
				//console.log("page::HandTileDragStart()");
				//dojo.addClass(this, 'tile_dragging');		//cant use css classes here because TileStack overrides the opacity on the div
				dojo.style(this, "opacity", 0.2);
				//the div id here is in the format "player_hand_item_XY"
				//event.dataTransfer.setData("text/plain", this.id);
				window.gameui.dragging_data_id = this.id;
			},
			
			HandTileDragEnd : function(event)
			{
				//console.log("page::HandTileDragEnd() " + this.id);
				//dojo.removeClass(this, 'tile_dragging');
				dojo.style(this, "opacity", 1);
				window.gameui.dragging_data_id = null;
			},
			
			HandTileDrop : function(event)
			{
				//console.log("HandTileDrop");
			},
			
			GetPlayercardDivId : function(player_id)
			{
				return "playercard_" + player_id;
			},
			
			GetCurrentPlayerVillagesDivId : function()
			{
				var current_player_id = this.getCurrentPlayer();
				return this.GetPlayerVillagesDivId(current_player_id);
			},
			
			GetPlayerVillagesDivId : function(player_id)
			{
				return "player_villages_" + player_id;
			},
			
			GetPlayercardScoreDivId : function(player_id)
			{
				return "playerboard_score_" + player_id;
			},
			
			GetPlayercardRegroupsDivId : function(player_id)
			{
				//left panel
				return "playercard_regroups_" + player_id;
			},
			
			GetPlayerboardRegroupsDivId : function(player_id)
			{
				//right panel
				return "playerboard_regroups_" + player_id;
			},
			
			GetPlayerHiddenHandDivId : function(player_id)
			{
				return "hidden_hand_tiles_" + player_id;
			},
			
			GetPlayerHiddenHandTextDivId : function(player_id)
			{
				return "hidden_hand_text_" + player_id;
			},
			
			GetPlayerHiddenBagDivId : function(player_id)
			{
				return "hidden_bag_tiles_" + player_id;
			},
			
			GetPlayerHiddenBagTextDivId : function(player_id)
			{
				return "hidden_bag_text_" + player_id;
			},
			
			GetPlayerHiddenDiscardDivId : function(player_id)
			{
				return "hidden_discard_tiles_" + player_id;
			},
			
			GetPlayerHiddenDiscardTextDivId : function(player_id)
			{
				return "hidden_discard_text_" + player_id;
			},
			
			GetPlayerboardScoreDivId : function(player_id)
			{
				//player boards on the right panel... this is also from the default bga playerboard
				return "player_score_" + player_id;
			},
			
			GetVillagesCapturedContainerId : function(player_id)
			{
				return "villages_captured_" + player_id;
			},
			
			GetVillagesCapturedTextNodeId : function(player_id)
			{
				return "villages_captured_text_" + player_id;
			},
			
			AddVillagesCaptured : function(player_id, num_new_villages)
			{
				//console.log("page::AddVillagesCaptured(" + player_id + "," + num_new_villages + ")");
				var player = this.gamedatas.players[player_id];
				//console.log(player);
				player.villages_captured = Number(player.villages_captured);
				player.villages_captured += num_new_villages;
				var player_captured_villages_node = dojo.byId(this.GetVillagesCapturedTextNodeId(player_id));
				player_captured_villages_node.firstChild.nodeValue = player.villages_captured;
			},
			
			GetCitadelsCapturedContainerId : function(player_id)
			{
				return "citadels_captured_" + player_id;
			},
			
			GetCitadelsCapturedTextNodeId : function(player_id)
			{
				return "citadels_captured_text_" + player_id;
			},
			
			GetVillagesAvailablePlayerboardTextDivId : function(player_id)
			{
				//note: this is for playerboard (right panel) version
				return "villages_remaining_" + player_id;
			},
			
			GetVillagesAvailablePlayercardTextDivId : function(player_id)
			{
				//note: this is for playercard (left panel) version
				return "villages_remaining_" + player_id;
			},
			
			UpdatePlayerScoreUI : function(player_id, new_score)
			{
				var player_score_div = dojo.byId(this.GetPlayercardScoreDivId(player_id));
				if(player_score_div)
				{
					player_score_div.innerText = new_score;
				}
				
				//this is an ebg counter from the default bga playerboard so it's handled a little differently
				this.scoreCtrl[player_id].toValue(new_score);
			},
			
			DiscardPlayerHandTiles : function()
			{
				//RemoveTilesFromStack : function(tile_infos, target_div_id = undefined)
				this.current_player_hand.RemoveTilesFromStack(this.current_player_hand.tiles);
			},
			
			CreatePlayerHandTiles : function(do_debug)
			{
				if(do_debug)	console.log("page::CreatePlayerHandTiles()");
				if(do_debug)	console.log(this);
				if(do_debug)	console.log(this.gamedatas.hand);
				//add all tiles to their hand
				for (let tile_id in this.gamedatas.hand)
				{
					if(do_debug)	console.log(tile_id);
					let tile_info = this.gamedatas.hand[tile_id];
					if(do_debug)	console.log(tile_info);
					//addToStockWithId( type, id, from )
					//this.current_player_hand.addToStockWithId(tile_info.type_arg, tile_id, "bag");
					//SpawnTileInStack : function(tile_info, source_div_id = undefined, selected = 1)
					this.current_player_hand.SpawnTileInStack(tile_info, "bag");
					
					var latest_tile_div = dojo.byId(this.current_player_hand.getItemDivId(tile_id));
					//dojo.connect(latest_tile_div, "click", dojo.hitch(this, this.onClickPlayerHandTile));	//for debugging
					/*latest_tile_div.draggable = true;
					latest_tile_div.ondragstart = this.HandTileDragStart;
					latest_tile_div.ondragend = this.HandTileDragEnd;
					latest_tile_div.ondrop = this.HandTileDrop;*/
					
					//unused
					//see TileDrag.js
					//this.SetDraggableTile(latest_tile_div);
				}
			},
			
			DrawNewHandTiles : function(new_tile_infos)
			{
				//console.log("page::DrawNewHandTiles()");
				//console.log(new_tile_infos);
				
				for(let tile_id in new_tile_infos)
				{
					let tile_info = new_tile_infos[tile_id];
					//console.log(tile_id);
					//console.log(tile_info);
					
					this.current_player_hand.SpawnTileInStack(tile_info, "bag");
				}
				
				let new_hand = {
					...this.gamedatas.hand,
					...new_tile_infos
				};
				this.gamedatas.hand = new_hand;
			},
			
			AddCitadelsCaptured : function(player_id, captured_faction)
			{
				console.log("page::AddCitadelsCaptured(" + player_id + "," + captured_faction + ")");
				//todo: this function
				var player = this.gamedatas.players[player_id];
				console.log(player);
				player.captured_citadels = Number(player.captured_citadels);
				player.captured_citadels += 1;
				var player_captured_citadels = dojo.byId(this.GetCitadelsCapturedTextNodeId(player_id));
				player_captured_citadels.firstChild.nodeValue = player.captured_citadels;
			},
			
			SetPlayerRegroups : function(player_id, new_regroups, ui_update = true)
			{
				var player = this.gamedatas.players[player_id];
				player.regroups = new_regroups;
				
				//update the ui now that it's changed
				if(ui_update)
				{
					this.UpdatePlayerRegroupsUI(player_id, new_regroups);
				}
			},
			
			UpdatePlayerRegroupsUI : function(player_id, new_regroups)
			{
				//left panel (only exists on current player client)
				var playercard_regroups = dojo.byId(this.GetPlayercardRegroupsDivId(player_id));
				if(playercard_regroups)
				{
					playercard_regroups.innerText = new_regroups;
				}
				
				//right panel (exists for every player client)
				var playerboard_regroups = dojo.byId(this.GetPlayerboardRegroupsDivId(player_id));
				playerboard_regroups.innerText = new_regroups;
			},
			
			SetVillagesRemaining : function(player_id, villages_available, ui_update = true)
			{
				var player = this.gamedatas.players[player_id];
				player.villages_available = villages_available;
				
				//update the ui now that it's changed
				if(ui_update)
				{
					this.UpdateVillagesRemainingUI(player_id, villages_available);
				}
			},
			
			UpdateVillagesRemainingUI : function(player_id, villages_available)
			{
				//right panel (exists for every player client)
				var villages_available_playerboard = dojo.byId(this.GetVillagesAvailablePlayerboardTextDivId(player_id))
				villages_available_playerboard.innerText = villages_available;
				
				//left panel (only exists on current player client)
				var villages_available_playercard = dojo.byId(this.GetVillagesAvailablePlayercardTextDivId(player_id));
				if(villages_available_playercard)
				{
					villages_available_playercard.innerHTML = villages_available;
				}
			},
			
			SetHiddenBagTiles : function(player_id, num_tiles, ui_update = true)
			{
				var player = this.gamedatas.players[player_id];
				player.tiles_bag = num_tiles;
				
				//update the ui now that it's changed
				if(ui_update)
				{
					this.UpdateHiddenBagTilesUI(player_id, num_tiles);
				}
			},
			
			UpdateHiddenBagTilesUI : function(player_id, num_tiles)
			{
				var player = this.gamedatas.players[player_id];
				let hidden_bag_text = dojo.byId(this.GetPlayerHiddenBagTextDivId(player_id));
				hidden_bag_text.innerText = num_tiles;
			},
			
			SetHiddenDiscardTiles : function(player_id, num_tiles, ui_update = true)
			{
				var player = this.gamedatas.players[player_id];
				player.tiles_discard = num_tiles;
				
				//update the ui now that it's changed
				if(ui_update)
				{
					this.UpdateHiddenDiscardTilesUI(player_id, num_tiles);
				}
			},
			
			UpdateHiddenDiscardTilesUI : function(player_id, num_tiles)
			{
				var player = this.gamedatas.players[player_id];
				let hidden_discard_text = dojo.byId(this.GetPlayerHiddenDiscardTextDivId(player_id));
				hidden_discard_text.innerText = num_tiles;
			},
			
			SetHiddenHandTiles : function(player_id, num_tiles, ui_update = true)
			{
				var player = this.gamedatas.players[player_id];
				player.tiles_hand = num_tiles;
				
				//update the ui now that it's changed
				if(ui_update)
				{
					this.UpdateHiddenHandTilesUI(player_id, num_tiles);
				}
			},
			
			UpdateHiddenHandTilesUI : function(player_id, num_tiles)
			{
				//console.log("page::UpdateHiddenHandTiles(" + player_id + "," + num_tiles + ")");
				var player = this.gamedatas.players[player_id];
				
				//player boards right panel
				let hidden_hand_text = dojo.byId(this.GetPlayerHiddenHandTextDivId(player_id));
				hidden_hand_text.innerText = num_tiles;//player.tiles_hand;
				
				//old code when enemy playercards were on the left panel but im leaving it here just in case
				/*
				let enemy_tiles = dojo.byId("enemy_tiles_" + player_id);
				if(!enemy_tiles)
				{
					return;
				}
				
				//create some new tiles
				var new_tiles = player.tiles_hand - enemy_tiles.childNodes.length;
				var factionid = player.factionid;
				for(var tilesleft = new_tiles; tilesleft > 0; tilesleft--)
				{
					let blanktile = dojo.place("<div class=\"blanktile blanktile" + factionid + "\"></div>", enemy_tiles);
				}
				
				//remove any extra tiles
				var remove_left = enemy_tiles.childNodes.length - player.tiles_hand;
				for(var i=remove_left; i > 0; i--)
				{
					dojo.destroy(enemy_tiles.firstChild);
				}
				*/
			}
			
		});
			
		return instance;
	}
);
