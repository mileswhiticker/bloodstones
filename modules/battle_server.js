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
		
		var instance = declare("_battle_server", null, {
			//put your functions here
			
			ServerStartBattle : function()
			{
				console.log("page::ServerStartBattle()");
				
				//sanity check
				if(this.preview_battle_province_name == null)
				{
					console.log("ERROR: called page::TryProceedCurrentBattle() but this.preview_battle_province_name == null");
					return;
				}
				
				//battle has not yet started
				if(window.gameui.checkAction('action_startBattle'))
				{
					//ajax call to pass the request back to php
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_startBattle.html", {
						battling_province_name: this.preview_battle_province_name,
						lock: true
						},
						 window.gameui, function( result ) {
							
							// What to do after the server call if it succeeded
							// (most of the time: nothing)
							
						 }, function( is_error) {

							// What to do after the server call in anyway (success or failure)
							// (most of the time: nothing)
						}
					);
				}
			},
			
			ServerRejectWithdraw : function()
			{
				console.log("page::ServerRejectWithdraw()");
				if(window.gameui.checkAction('action_rejectWithdraw'))
				{
					//ajax call to pass the request back to php
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_rejectWithdraw.html", {
						lock: true
						},
						 window.gameui, function( result ) {
							
							// What to do after the server call if it succeeded
							// (most of the time: nothing)
							
						 }, function( is_error) {

							// What to do after the server call in anyway (success or failure)
							// (most of the time: nothing)
						}
					);
				}
			},
			
			ServerSwapTile : function()
			{
				//console.log("page::ServerSwapTile()");
				
				//it's my turn to play a tile
				if(this.current_player_paystack.tiles.length > 1)
				{
					console.log("ERROR: attempting to swap more than 1 tile at once");
				}
				
				var tile_id = -1;
				//console.log(this.current_player_paystack);
				var processed_tileswap = false;
				for(var check_tile_id in this.current_player_paystack.tiles)
				{
					if(processed_tileswap == true)
					{
						console.log("WARNING: player is attempting to swap multiple tiles in one go");
						continue;
					}
					tile_id = check_tile_id;
					
					//var tile_id_string = this.current_player_paystack.tiles[0];
					//var tile_info = this.current_player_paystack.tiles[tile_id_string];
					//var tile_id = tile_info.id;
					//console.log("player is swapping tile " + tile_id);
					
					//only skip one tile at a time
					processed_tileswap = true;
				}
				
				if(tile_id == -1)
				{
					//console.log("player is skipping a tileswap");
				}
				
				//now send the request to server to swap in the tile
				if(window.gameui.checkAction('action_swapTile'))
				{
					//ajax call to pass the request back to php
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_swapTile.html", {
						swap_tile_id: tile_id,
						lock: true
						},
						 window.gameui, function( result ) {
							
							// What to do after the server call if it succeeded
							// (most of the time: nothing)
							
						 }, function( is_error) {

							// What to do after the server call in anyway (success or failure)
							// (most of the time: nothing)
						}
					);
				}
			},
			
			ServerChooseWithdraw : function()
			{
				//console.log("page::ServerChooseWithdraw()");
				if(window.gameui.checkAction('action_chooseWithdraw'))
				{
					//ajax call to pass the request back to php
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_chooseWithdraw.html", {
						lock: true
						},
						 window.gameui, function( result ) {
							
							// What to do after the server call if it succeeded
							// (most of the time: nothing)
							
						 }, function( is_error) {

							// What to do after the server call in anyway (success or failure)
							// (most of the time: nothing)
						}
					);
				}
			},
			
			ServerSacrificeTile : function(tile_info)
			{
				if(this.gamedatas.gamestate.name == "battleEnd")
				{
					//is this move allowed?
					if(window.gameui.checkAction('action_sacrificeUnit'))
					{
						window.gameui.ajaxcall( "/bloodstones/bloodstones/action_sacrificeUnit.html", {
							sacrifice_tile_id: tile_info.id,
							lock: true
							}, 
							 window.gameui, function( result ) {
								
								// What to do after the server call if it succeeded
								// (most of the time: nothing)
								
							 }, function( is_error) {

								// What to do after the server call in anyway (success or failure)
								// (most of the time: nothing)
							}
						);
					}
				}
			},
			
			ServerWithdraw : function(prov_name)
			{
				console.log("page::ServerWithdraw(" + prov_name + ")");
				//is this move allowed?
				if(window.gameui.checkAction('action_withdraw'))
				{
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_withdraw.html", {
						retreat_prov_name: prov_name,
						lock: true
						}, 
						 window.gameui, function( result ) {
							
							// What to do after the server call if it succeeded
							// (most of the time: nothing)
							
						 }, function( is_error) {

							// What to do after the server call in anyway (success or failure)
							// (most of the time: nothing)
						}
					);
				}
			},
			
			ServerRetreat : function(prov_name)
			{
				//is this move allowed?
				if(window.gameui.checkAction('action_retreat'))
				{
					window.gameui.ajaxcall( "/bloodstones/bloodstones/action_retreat.html", {
						retreat_prov_name: prov_name,
						lock: true
						}, 
						 window.gameui, function( result ) {
							
							// What to do after the server call if it succeeded
							// (most of the time: nothing)
							
						 }, function( is_error) {

							// What to do after the server call in anyway (success or failure)
							// (most of the time: nothing)
						}
					);
				}
			},
			
		});
		
		return instance;
	}
);
