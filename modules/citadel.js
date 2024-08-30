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
			
			SetupCitadels : function(gamedatas)
			{
				for(var player_id in gamedatas.players)
				{
					var player_info = gamedatas.players[player_id];
					if(player_info.citadel_prov != -1)
					{
						var citadel_prov_name = this.GetProvinceNameFromId(player_info.citadel_prov);
						this.CreateCitadel(citadel_prov_name, player_id);
					}
				}
			},
			
			CreateCitadel : function(province_name, owner_player_id)
			{
				//console.log("page::CreateCitadel(" + province_name + "," + owner_player_id + ")");
				var citadel_info = {player_id: owner_player_id, province_id: province_name, tiles: {}, army_id: this.getTempArmyId()};
				var citadel_stack = new modules.TileStack();
				citadel_stack.createAsCitadel(this, "centrepanel", citadel_info);	//node id formerly "gamemap"
				//this.villagestacks_by_province[province_name] = villagestack;
				this.citadel_stacks.push(citadel_stack);
				citadel_stack.addCitadel(this.getPlayerFactionId(owner_player_id));
			},
			
			DestroyCitadel : function()
			{
				//todo
			},
			
			ServerPlaceCitadel : function(province_name)
			{
				console.log("page::ServerPlaceCitadel()");
				
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
