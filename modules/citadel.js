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
		
		var instance = declare("_citadel", null, {
			//place your functions here
			
			BeginCitadelState : function()
			{
				this.UIBeginPlaceCitadel()
				//this.StartAnimatedCanvas(this.UICanvasRenderPlaceCitadelOverlay);
			},
			
			EndCitadelState : function(province_name)
			{
				//console.log("page::EndCitadelState(" + province_name + ")");
				if(this.possible_citadel_provinces.includes(province_name))
				{
					this.UIFinishPlaceCitadel();
					this.ServerPlaceCitadel(province_name);
				}
				else
				{
					console.log("WARNING: page::EndCitadelState(" + province_name + ") illegal province clicked");
				}
			},
			
			SetupCitadels : function()
			{
				//console.log("page::SetupCitadels()");
				for(var player_id in this.gamedatas.players)
				{
					var player = this.gamedatas.players[player_id];
					//console.log(player_id);
					//console.log(player);
					
					//has a citadel province been assigned yet?
					if(!player.citadel_tile_info)
					{
						//console.log("no citadel tile info");
						continue;
					}
					var citadel_prov_name = this.GetProvinceNameFromId(player.citadel_prov_id);
					this.CreateCitadelStack(citadel_prov_name, player_id, player.citadel_tile_info);
				}
			},
			
			CreateCitadelStack : function(citadel_prov_name, player_id, citadel_tile_info)
			{
				//console.log("page::CreateCitadelStack(" + citadel_prov_name + "," + player_id + ", [])");
				//console.log(citadel_tile_info);
				var player = this.gamedatas.players[player_id];
				
				var temp_army_info = {army_id: this.getTempArmyId(), player_id: player_id, prov_name: citadel_prov_name, tiles: [citadel_tile_info]};
				player.citadel_stack = new modules.TileStack();
				player.citadel_stack.createAsArmyCitadel(this, "centrepanel", temp_army_info);
			},
			
			ServerPlaceCitadel : function(province_name)
			{
				//console.log("page::ServerPlaceCitadel()");
				
				//is this move allowed?
				if(window.gameui.checkAction('action_playerPlaceCitadel'))
				{
					//send this to the server
					//see action.php
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_playerPlaceCitadel.html", {
						prov_name: province_name,
						lock: true
						}, 
						 window.gameui, function( result ) {
							
							// What to do after the server call if it succeeded
							// (most of the time: nothing)
							
						 }, function( is_error) {

							// What to do after the server call in anyway (success or failure)
							// (most of the time: nothing)
							
							// here we will reset the provisional move in the player's UI and refund the tiles spent
						}
					);
				}
			}
		});
		
		return instance;
	}
);
