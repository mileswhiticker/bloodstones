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
		
		var instance = declare("_battle_ui_circles", null, {
			//put your functions here
			
			CreatePendingBattleCircles : function()
			{
				//console.log("page::CreatePendingBattleCircles()");
				//console.log(this.gamedatas.pending_battles);
				
				//sanity check 
				if(this.pending_battle_circles.length > 0)
				{
					console.log("page::CreatePendingBattleCircles() ERROR: this.pending_battle_circles.length == " + this.pending_battle_circles.length);
					return;
				}
				for(var cur_province_id in this.gamedatas.pending_battles)
				{
					//console.log("cur_province_id: " + cur_province_id);
					//create a animated UI overlay that highlights the battle on the map
					var battle_province_info = this.provinces_by_name[cur_province_id];
					var new_node_id = "battle_circle_" + cur_province_id;
					
					//check if a circle already exists
					if(dojo.byId(new_node_id) == null)
					{
						var battle_circle = dojo.place("<div class=\"battle_circle\" id=\"" + new_node_id + "\"></div>","gamemap");
						//the magnifying glass image is set to 200*200px in css, so offset the image position by half that
						var world_x = battle_province_info.centre.x * this.svg_scale_factor - 100;
						var world_y = battle_province_info.centre.y * this.svg_scale_factor - 100;
						var coords_canvas = this.WorldToCanvasCoords(world_x, world_y);
						battle_circle.style.left = coords_canvas.x + "px";
						battle_circle.style.top = coords_canvas.y  + "px";
						battle_circle.style.width = 200 * this.map_view_scale + "px";
						battle_circle.style.height = 200 * this.map_view_scale + "px";
						
						//remember it for later
						this.pending_battle_circles.push(new_node_id);
					}
					
					//some assumptions which im fairly sure are safe: 
					
					// 1. there is never more than 2 factions in a province
					// (because the only way for an army to enter a province is if a player builds or moves it there
					// (and player turn cant end if there are two faction armies in a province... they must battle)
					
					// 2. all units in a province must fight 
					
					//create a button to preview this battle before starting it
					var armies = this.gamedatas.pending_battles[cur_province_id].armies;
					for(var army_id in armies)
					{
						var battle_army_info = armies[army_id];
						
						//we want the enemy faction id here
						if(battle_army_info.player_id != this.getActivePlayerId())
						{
							var enemy_faction_id = this.getPlayerFactionId(battle_army_info.player_id);
							//console.log("creating start battle button for faction_id: " + enemy_faction_id);
							
							//create an outer div for the button
							var outer_classes = "button_preview_battle_outer blanktile" + enemy_faction_id;
							var outer_button_id = "button_preview_battle_" + cur_province_id;
							var preview_battle_button = dojo.place("<div class=\"" + outer_classes + "\" id=\"" + outer_button_id + "\"></div>","gamemap");
							this.pending_battle_buttons.push(preview_battle_button);
							
							//calculate the position we will put this button
							var world_x = battle_province_info.centre.x * this.svg_scale_factor - 90;
							var world_y = battle_province_info.centre.y * this.svg_scale_factor - 20;
							var coords_canvas = this.WorldToCanvasCoords(world_x, world_y);
							
							//place the button
							preview_battle_button.style.left = coords_canvas.x + "px";
							preview_battle_button.style.top = coords_canvas.y  + "px";
							preview_battle_button.style.width = 40 * this.map_view_scale + "px";
							preview_battle_button.style.height = 40 * this.map_view_scale + "px";
							
							//connect the onclick handler
							dojo.connect(preview_battle_button, "click", dojo.hitch(this, this.onClickPreviewBattle));
							
							//create the inner image
							var inner_button_id = "button_start_battle_inner_" + cur_province_id;
							var preview_battle_button_inner = dojo.place("<div class=\"button_preview_battle_inner\" id=\"" + inner_button_id + "\"></div>",outer_button_id);
							
							//we are finished, we only need 1 button per province
							break;
						}
					}
				}
			},
			
			DestroyPendingBattleCircles : function()
			{
				for(var i in this.pending_battle_circles)
				{
					var cur_node_id = this.pending_battle_circles[i];
					dojo.destroy(cur_node_id);
				}
				this.pending_battle_circles = [];
				for(var i in this.pending_battle_buttons)
				{
					var cur_node_id = this.pending_battle_buttons[i];
					dojo.destroy(cur_node_id);
				}
				this.pending_battle_buttons = [];
			},
			
			RefreshPendingBattleCircles : function()
			{
				if(this.pending_battle_circles.length > 0)
				{
					this.DestroyPendingBattleCircles();
					this.CreatePendingBattleCircles();
				}
			},
			
		});
		
		return instance;
	}
);
