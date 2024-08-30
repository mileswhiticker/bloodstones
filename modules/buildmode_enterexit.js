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
		
		var instance = declare("_buildmode_enterexit", null, {
			//put your functions here
			
			EnterBuildMode : function()
			{
				if(this.isCurrentPlayerMainState())
				{
					//this.queued_province_moves = [];
					//this.queued_province_moves_by_army = [];
					//this.queued_action_steps = {};
					this.enterSmallPhase(STATE_MAIN_BUILD);
					this.AddBuildModeUI();
					this.EnablePaymentBucket(STATE_MAIN_BUILD);
					
					//reset these
					this.pulsing_province_time = 0;
					this.prev_frame_timestamp = 0;
					this.pulsing_province_dir = 1;
					
					//this.prev_frame_timestamp = this.date.getTime();
					this.build_mode_cancel_anim = window.requestAnimationFrame(this.buildmodeAnimFrame);
					//this.ResetActionInfo(STATE_MAIN_BUILD);
				}
				else
				{
					console.log("WARNING: page::EnterBuildMode() but not in main phase");
				}
			},
			
			ExitBuildMode : function(approved)
			{
				//console.log("page::ExitBuildMode(" + approved + ")");
				
				//have any actions been taken?
				if(this.queued_builds.length == 0)
				{
					approved = false;
				}
				
				//enter the next phase
				if(approved)
				{
					//this.enterSmallPhase(STATE_MAIN_RESET);
					this.ServerPayAction(ACTION_BUILD);
				}
				else
				{
					this.CleanupBuildMode(false);
				}
				
				//console.log("page::ExitBuildMode(" + approved + ")");
				if(this.isCurrentPlayerBuildMode())
				{
					this.RemoveBuildModeUI();
					window.cancelAnimationFrame(this.build_mode_cancel_anim);
					
					//now clean up
					this.queued_builds = {};
					this.UnselectArmyStack();
					
					if(this.gamedatas.gamestate.name != "freeBuild" && this.gamedatas.gamestate.name != "freeBuild_chaosHorde")
					{
						if(approved)
						{
							this.enterSmallPhase(STATE_MAIN_RESET);
						}
						else
						{
							this.enterSmallPhase(STATE_MAIN_DEFAULT);
						}
					}
				}
				else
				{
					console.log("WARNING: page::ExitBuildMode() but not in build phase");
				}
			},
			
			CleanupBuildMode : function(build_success)
			{
				//console.log("page::CleanupBuildMode(" + build_success + ")");
				if(!build_success)
				{
					this.RefundPaystackTiles();
				}
				this.DestroyPayWindow();
				
				//clean up all the planned builds
				//console.log(this.queued_build_armies_by_province);
				for(var prov_name in this.queued_build_armies_by_province)
				{
					//console.log(prov_name);
					var cur_army = this.queued_build_armies_by_province[prov_name];
					
					//restore these tiles to hand if the build failed
					if(!build_success)
					{
						for(var tile_id_string in cur_army.tiles)
						{
							//var tile_info = this.current_player_hand.GetTileInfo(tile_id);
							var tile_info = cur_army.tiles[tile_id_string];
							this.current_player_hand.SpawnTileInStack(tile_info);
						}
					}
					
					//do we need to unselect this army?
					if(window.gameui.selected_army == cur_army)
					{
						this.UnselectArmyStack();
					}
					
					//finally clean up the planned army
					//if the build was a successul, then the army will simply be recreated
					//todo: wouldn't it be graphically nicer to just keep the army and fade it in?
					this.DestroyArmy(cur_army.id_num);
				}
				this.queued_build_armies_by_province = [];
				
				if(window.gameui.isCurrentPlayerResetMode())
				{
					window.gameui.enterSmallPhase(STATE_MAIN_DEFAULT);
				}
				else
				{
					//player can exit directly from build mode
					//console.log("WARNING: CleanupBuildMode() but not in STATE_MAIN_RESET");
				}
			},
			/*
			HandRestoreTileAnimation : function(sliding_tile_id, target_army_id)
			{
				//start a visual effect of the tile sliding to its destination
				//console.log("page::SelectedArmySplitAnimation(" + sliding_tile_id + "," + target_army_id + ")");
				
				//var tile_host_div_id = this.GetSelectedTileIdString(sliding_tile_id);
				var army_div_id = this.GetArmyIdString(target_army_id);
				var tile_image_div_id = this.GetSelectedTileImageIdString(sliding_tile_id);
				//console.log("sliding: " + tile_image_div_id + " | " + army_div_id);
				
				var gamewindow = dojo.byId("gamewindow");
				var tile_image_div = dojo.byId(tile_image_div_id);
				
				//var image_position = dojo.position(tile_image_div);
				var image_x = dojo.position(tile_image_div).x - dojo.position(gamewindow).x;
				var image_y = dojo.position(tile_image_div).y - dojo.position(gamewindow).y;
				
				//create a copy of the original tile image
				var sliding_image = tile_image_div.cloneNode(true);
				sliding_image.id += "_clone";
				//console.log(sliding_image);
				gamewindow.appendChild(sliding_image);
				
				//hide the original image
				dojo.style(tile_image_div, "opacity", "0");
				
				dojo.style(sliding_image, "z-index", this.GameLayerFloat());
				dojo.style(sliding_image, "position", "absolute");
				dojo.style(sliding_image, "left", image_x + "px");
				dojo.style(sliding_image, "top", image_y + "px");
				//console.log("(" + image_x + "," + image_y + ")");
				//dojo.style(sliding_image,"position", "absolute");
				
				var duration_ms = 300;
				var slideAnim = this.slideToObject(sliding_image, army_div_id, duration_ms);
				var fadeAnim = fx.fadeOut({
					node: sliding_image,
					duration: duration_ms,
					onEnd: function(){
						dojo.destroy(sliding_image);
						//console.log("finished");
				   }
				});
				
				coreFx.combine([fadeAnim, slideAnim]).play();
			},
			*/
			
		});
		
		return instance;
	}
);