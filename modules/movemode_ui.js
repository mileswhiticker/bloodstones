/*
 * ------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * bloodstones implementation : © Miles Whiticker <miles.whiticker@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */
 
const LABEL_NONE = -1;
const LABEL_MOVECOST = 0;

define(
	[
		"dojo",
		"dojo/_base/declare"
	],
	function (dojo, declare){
		
		var instance = declare("_movemode_ui", null, {
			//put your functions here
			
			AddProvinceMoveLink : function(start_province_info, dest_province_info, overlay_type)
			{
				//console.log("page::AddProvinceMoveLink(" + start_province_info.name + ", " + dest_province_info.name + ", " + overlay_type + ")");
				//console.log(start_province_info);
				//console.log(dest_province_info);
				
				for(var move_link_index = 0; move_link_index < start_province_info.linked_prov_ids; move_link_index++)
				{
					//which province is this?
					var check_prov_id = start_province_info.linked_prov_ids[move_link_index];
					
					//is this the province we are drawing a link to?
					if(check_prov_id == dest_province_info.id)
					{
						//found it
						var move_link = start_province_info.movelinks[move_link_index];
						this.AddProvinceMoveLinkPath(move_link.path_segments, overlay_type, false);
						break;
					}
				}
			},
			
			GetNextColourCycle : function()
			{
				var retval = Colour(this.colour_cycle.r, this.colour_cycle.g, this.colour_cycle.b, 255);
				this.colour_cycle.addRGB(this.colour_progression);
				return retval;
			},
			
			AddProvinceMoveLinkPath : function(path_segments, overlay_type, do_debug = false)
			{
				if(do_debug)	console.log("page::AddProvinceMoveLinkPath(path_segments, " + overlay_type + ")");
				//if(do_debug)	console.log(path_segments);
				
				const canvas = dojo.byId("province_overlay_canvas");
				const context = canvas.getContext("2d");
				var scale_factor = this.svg_scale_factor;
				
				//draw the polygon that will form the province overlay
				context.beginPath();
				context.moveTo(0,0);
				
				//new method of doing province outlines
				var current_coords = {x:0,y:0};
				var scale_factor = this.svg_scale_factor;
				
				//iterate over the loaded path segments and draw them
				for (let j in path_segments)
				{
					var pathseg = path_segments[j];
					
					switch(pathseg.type)
					{
						case 'm':
						{
							current_coords.x += pathseg.points[0].x * scale_factor;
							current_coords.y += pathseg.points[0].y * scale_factor;
							
							var current_coords_canvas = this.WorldToCanvasCoords(current_coords.x,current_coords.y);
							context.moveTo(current_coords_canvas.x, current_coords_canvas.y);
							break;
						}
						case 'M':
						{
							current_coords.x = pathseg.points[0].x * scale_factor;
							current_coords.y = pathseg.points[0].y * scale_factor;
							
							var current_coords_canvas = this.WorldToCanvasCoords(current_coords.x,current_coords.y);
							context.moveTo(current_coords_canvas.x, current_coords_canvas.y);
							break;
						}
						case 'c':
						{
							//console.log(pathseg.points);
							var control_point1 = {x:current_coords.x + pathseg.points[0].x * scale_factor, y:current_coords.y + pathseg.points[0].y * scale_factor};
							var control_point2 = {x:current_coords.x + pathseg.points[1].x * scale_factor, y:current_coords.y + pathseg.points[1].y * scale_factor};
							var end_point = {x:current_coords.x + pathseg.points[2].x * scale_factor, y:current_coords.y + pathseg.points[2].y * scale_factor};
							
							var control_point1_canvas = this.WorldToCanvasCoords(control_point1.x,control_point1.y);
							var control_point2_canvas = this.WorldToCanvasCoords(control_point2.x,control_point2.y);
							var end_point_canvas = this.WorldToCanvasCoords(end_point.x,end_point.y);
							
							context.bezierCurveTo(control_point1_canvas.x, control_point1_canvas.y, control_point2_canvas.x, control_point2_canvas.y, end_point_canvas.x, end_point_canvas.y);
							
							//update the current position of the draw cursor
							current_coords = end_point;
							break;
						}
						case 'C':
						{
							var control_point1 = {x:pathseg.points[0].x * scale_factor, y:pathseg.points[0].y * scale_factor};
							var control_point2 = {x:pathseg.points[1].x * scale_factor, y:pathseg.points[1].y * scale_factor};
							var end_point = {x:pathseg.points[2].x * scale_factor, y:pathseg.points[2].y * scale_factor};
							
							var control_point1_canvas = this.WorldToCanvasCoords(control_point1.x,control_point1.y);
							var control_point2_canvas = this.WorldToCanvasCoords(control_point2.x,control_point2.y);
							var end_point_canvas = this.WorldToCanvasCoords(end_point.x,end_point.y);
							
							context.bezierCurveTo(control_point1_canvas.x, control_point1_canvas.y, control_point2_canvas.x, control_point2_canvas.y, end_point_canvas.x, end_point_canvas.y);
							
							//update the current position of the draw cursor
							current_coords = end_point;
							break;
						}
					}
				}
				
				context.lineWidth = this.province_link_width * this.map_view_scale;
				//var overlay_colour = this.GetNextColourCycle().rgba();
				var overlay_colour = this.GetProvinceOverlayColour(overlay_type);
				if(do_debug)	console.log(overlay_colour);
				context.strokeStyle = overlay_colour.rgba();
				context.stroke();
			},
			
			HandleMovemodeArmyClicked : function(clicked_army)
			{
				//console.log("page::HandleMovemodeArmyClicked(" + clicked_army.id_string + ")");
				//this function is no longer used
				//is this our army?
				if(clicked_army.player_id == this.getCurrentPlayer())
				{
					//do we already have an army selected?
					if(this.selected_army == null)
					{
						//select this army
						this.SelectArmyStack(clicked_army);
						this.RefreshMoveModeUI();
					}
					else if(this.selected_army == clicked_army)
					{
						//unselect this army
						this.UnselectArmyStack();
						this.RefreshMoveModeUI();
					}
					else if(this.selected_army.prov_name == clicked_army.prov_name)
					{
						//does the other army have queued moves?
						if(!clicked_army.IsMoving())
						{
							//does this army have queued moves?
							if(!this.selected_army.IsMoving())
							{
								//do nothing for now
								/*
								//dont merge in 
								//merge the selected units into the target army
								var selected_tile_ids = this.selected_army.getSelectedTileIds();
								this.ServerArmyMerge(this.selected_army, clicked_army, selected_tile_ids);
								
								this.RefreshMoveModeUI();
								*/
							}
							else
							{
								this.showMessage(_('You must finish moving this army before merging it.'), 'error');
							}
						}
						else
						{
							this.showMessage(_('That army must finish its move before merging.'), 'error');
						}
					}
					else
					{
						//this.showMessage(_('Finish planning your current move before selecting another army.'), 'error');
						
						//change selection to the other army
						this.UnselectArmyStack();
						this.SelectArmyStack(clicked_army);
						this.RefreshMoveModeUI();
					}
				}
			},
			
			HandleMovemodeProvinceClicked : function(clicked_province_name)
			{
				//console.log("page::HandleMovemodeProvinceClicked(" + clicked_province_name + ")");
				if(this.GetSelectedProvinceName() == clicked_province_name)
				{
					this.MergeReserveArmyBackIntoMain();
					this.UnselectProvince();
				}
				else if(this.IsAnyProvinceSelected())
				{
					this.TryQueueProvinceMove(clicked_province_name);
				}
				else
				{
					this.SelectProvince(clicked_province_name);
				}
			},
			
			SetMovemodeMapInteraction : function()
			{
				this.SetProvinceOverlayMode(this.OVERLAY_MOVE);
				this.on_select_map_overlay_callback = this.OnProvinceSelectMovemodeMapOverlay;
				this.on_unselect_map_overlay_callback = this.OnProvinceUnselectMovemodeMapOverlay;
			},
			
			OnProvinceSelectMovemodeMapOverlay : function(province_name)
			{
				//console.log("page::OnProvinceSelectMovemodeMapOverlay(" + province_name + ")");
				
				//is there player army units in this province?
				var main_player_army = this.GetMainPlayerArmyInProvinceOrNull(province_name, this.player_id);
				if(main_player_army)
				{
					//loop over all items (tiles) in this army and find any castles
					var castle_tile_ids = [];
					for(var i in main_player_army.items)
					{
						var item = main_player_army.items[i];
						
						//is this one a castle?
						if(this.IsTileTypeCastle(item.type))
						{
							//remember it for later
							castle_tile_ids.push(item.id);
						}
					}
					
					//loop over all castles we found, and automatically unselect them from moving
					for(var i in castle_tile_ids)
					{
						var cur_tile_id = castle_tile_ids[i];
						this.HandleClickArmySelectedTileMovemode(cur_tile_id);
					}
				}
				
				//console.log("page::OnProvinceSelectMovemodeMapOverlay()");
				this.UpdateCurrentOverlayMode();
			},
			
			OnProvinceUnselectMovemodeMapOverlay : function(province_name)
			{
				//console.log("page::OnProvinceUnselectMovemodeMapOverlay()");
				this.UpdateCurrentOverlayMode();
			},
			
		});
		
		return instance;
	}
);
