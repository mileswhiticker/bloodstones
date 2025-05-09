/*
 * ------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * bloodstones implementation : © Miles Whiticker <miles.whiticker@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */
 
const STACK_UNDEFINED = 0;
const STACK_ARMY = 1;
const STACK_PLAYERHAND = 2;
const STACK_OTHERUNITS = 3;
const STACK_VILLAGE = 4;
const STACK_PAYMENT = 5;
const STACK_BATTLE_DISPLAY = 6;
const STACK_BATTLE_DISPLAY_ATTACKER = 7;
const STACK_BATTLE_DISPLAY_DEFENDER = 8;
const STACK_BATTLE_TILES = 9;
const STACK_BATTLE_TILES_TEMP = 10;
const STACK_BATTLE_TILES_REJECT = 11;
const STACK_ARMY_SELECTED = 12;
const STACK_ARMY_CITADEL = 13;
const STACK_ARMY_CASTLE = 14;

define(
	[
		"dojo",
		"dojo/_base/declare",
		"dojo/_base/fx",
		"dojo/_base/lang",
		"dojo/on",
		"dojo/dom-class",
		"dojo/dom-attr",
		"ebg/stock"
	],
	function (dojo, declare, dojofx, domClass, domAttr, lang, on, stock){
		
		var static_item_type = {};
		var initialised_statics = false;
		//console.log(singleton);
		
		//i have heavily overriden stock here but there is still some of the basic functionality
		//for full source see: https://x.boardgamearena.net/data/themereleases/220811-1000/js/modules/stock.js
		
		var singleton = declare("modules.TileStack", ebg.stock, {
			constructor: function(){
				this.tilewidth = 359;
				this.tileheight = 181;
				this.items_per_line = 99;
				this.item_type = static_item_type;
				this.stack_type = STACK_UNDEFINED;	//0 undefined, 1 army, 2 player hand, 3 citadel, 4 village, 5 payment stack
				//this.extraClasses = "tile";
				//this.backgroundSize = "1200% auto";
				this.jstpl_stock_item = '<div id="${id}" class="stockitem ${extra_classes}" style="top:${top}px;left:${left}px;width:${width}px;height:${height}px;${position};background-image:url(\'${image}\');${additional_style}"></div>';
				
				// stack selection
				// this.selectable  = 0: no stock item can be selected
				//                    1: one stock item can be selected
				//                    2: several stock items can be selected
				
				// new bloodstones property:
				// this.selectable  = 3: select or deselect the entire stack only
				this.stack_is_selected = false;
				
				this.debugging = 0;
				this.id_num = undefined;
				this.id_string = "ERROR_ID_UNSET";
				this.selected_div = null;
				this.selected_opacity = 0.6;
				this.tiles = {};
				this.tiles_array = [];
				this.tiles_selected = {};
				this.spawn_fadein = true;
				this.spawn_fadeout = true;
				this.max_weight = 0;	//used for forced reordering with select/unselect in the army select panel
				
				this.player_id = -1;
				this.province_id = -1;
				this.prov_name = "NA";
				this.ghosted = false;
				this.isBuilding = false;
				this.isMoving = false;
				this.starting_province_location = null;
				this.duration = 500;	//default 1000, used for tile stacking and unstacking animation
				this.extraClassesContainer = "";
				this.ui_attacker_layout = false;
				this.hide_all_except_top = false;
				this.display_stack_size = false;
				
				this.custom_item_render_callback = null;
				this.custom_container_height_function = null;
				this.custom_item_item_remove_callback = null;
			},
			
			create: function(page, host_div_id/*,container_div, item_width, item_height*/)
			{
				this.container_div = dojo.place("<div id=\"" + this.id_string + "\" style=\"position:absolute;\" class=\"" + this.extraClassesContainer + "\"></div>",host_div_id,"last");	//"last" is the default option
				
				this.inherited(arguments, [page, this.container_div, this.tilewidth, this.tileheight]);
				/*var x_ratio = this.tilewidth / this.tileheight;
				var default_size = 90;
				console.log("x_ratio:" + x_ratio + " x,y:" + default_size * x_ratio + "," + default_size);
				this.resizeItems(default_size * x_ratio, default_size);
				*/
				
				this.order_items = false;
				this.autowidth = false;
				this.use_vertical_overlap_as_offset = false;
				
				//settings for loading the sprite sheet
				this.image_items_per_row = gameui.SPRITESHEET_ROW_TILES;
				this.number_of_rows = gameui.SPRITESHEET_ROWS;
				this.backgroundSize = (this.image_items_per_row*100) + "% " + (this.number_of_rows*100) + "%";
				
				//create the potential units to go in this stack
				this.max_faction_id = 6;	//number of factions
				this.max_unit_type = this.max_faction_id * this.image_items_per_row;
				this.battle_tiles_offset = gameui.TILE_DICE_MIN;		//the position in the sprite sheet
				//this.citadel_type_offset = this.battle_tiles_offset + 6;	//the position in the sprite sheet
				this.village_tiles_offset = this.image_items_per_row * 8;	//in separate images but should be part of the sprite sheet. this type number pretends they are another bottom row
				if(!initialised_statics)
				{
					initialised_statics = true;
					
					//define all standard unit tiles
					for(let cur_faction_id = 0; cur_faction_id < this.max_faction_id; cur_faction_id++)
					{
						for(let row_index = 0; row_index < this.image_items_per_row; row_index++)
						{
							var tile_type = cur_faction_id * this.image_items_per_row + row_index;
							//console.log("DEBUG tile_type:" + tile_type);
							this.addItemType(tile_type, 0, g_gamethemeurl + 'img/spritesheet.png', tile_type);
						}
						
						//create citadels for first five factions: different handling because they are different dimensions
						//chaos faction doesn't have a citadel
						/*if(cur_faction_id <= 4)
						{
							var tile_type = this.citadel_type_offset + cur_faction_id;
							this.addItemType(tile_type, 0, g_gamethemeurl + 'img/citadel' + cur_faction_id + '.png', tile_type);
						}*/
						
						//create villages
						//this is messy but should work
						//ideally this would be merged in with the main spritesheet, instead im being lazy and doing the images as separate classes
						if(cur_faction_id <= 4)	//chaos faction doesn't have villages
						{
							var tile_type = this.village_tiles_offset + cur_faction_id;
							//console.log("DEBUG tile_type:" + tile_type);
							//this.addItemType(tile_type, 0, g_gamethemeurl + 'img/village' + cur_faction_id + '.png');
							this.addItemType(tile_type, tile_type, g_gamethemeurl + 'img/spritesheet.png', tile_type);
						}
					}
					
					//create the random battle "dice" tiles
					for(let rowoffset = 0; rowoffset <= 1; rowoffset++)
					{
						for(let tilenum = 0; tilenum < gameui.TILE_DICE_NUM_TYPES; tilenum++)
						{
							var tile_type = this.battle_tiles_offset + tilenum + (rowoffset * this.image_items_per_row);
							//console.log("creating battle tile: " + tile_type);
							this.addItemType(tile_type, tile_type, g_gamethemeurl + 'img/spritesheet.png', tile_type);
						}
					}
					
					//create some invisible tiles
					var numbattletiles_max = 4;
					for(let numbattletiles = 0; numbattletiles < numbattletiles_max; numbattletiles++)
					{
						this.addItemType(gameui.ATTACKER_TILE_TYPE, gameui.ATTACKER_TILE_TYPE, g_gamethemeurl + 'img/spritesheet.png', gameui.ATTACKER_TILE_TYPE);
						this.addItemType(gameui.DEFENDER_TILE_TYPE, gameui.DEFENDER_TILE_TYPE, g_gamethemeurl + 'img/spritesheet.png', gameui.DEFENDER_TILE_TYPE);
					}
				}
				//console.log(this);
			},
			
			createAsArmyCitadel: function(page, host_div_id, army_info, from_div_id)
			{
				var retval = this.createAsArmy(page, host_div_id, army_info, from_div_id);
				this.stack_type = STACK_ARMY_CITADEL;
				return retval;
			},
			
			IsArmyCitadel : function()
			{
				return (this.stack_type == STACK_ARMY_CITADEL);
			},
			
			createAsArmyCastle: function(page, host_div_id, army_info, from_div_id)
			{
				var retval = this.createAsArmy(page, host_div_id, army_info, from_div_id);
				this.stack_type = STACK_ARMY_CASTLE;
				return retval;
			},
			
			IsArmyCastle : function()
			{
				return (this.stack_type == STACK_ARMY_CASTLE);
			},
			
			createAsArmy: function(page, host_div_id, army_info, from_div_id)
			{
				//console.log("TileStack::createAsArmy(page," + host_div_id + ",army_info," + from_div_id + ")");
				//console.log(army_info);
				//container_div
				
				//this doesnt need to be passed in as argument
				host_div_id = "centrepanel";
				
				//console.log(army_info);
				//override the default toString() method so we can do type checking on the object
				Object.getPrototypeOf(this).toString = function tileStackToString()
				{
					return "ArmyTileStack";
				};
				
				this.id_num = army_info.army_id;
				this.player_id = army_info.player_id;
				this.id_string = page.GetArmyIdString(army_info.army_id, this.player_id);
				this.create(page, host_div_id);
				//this.container_div.dataset.blstplayerid = army_info.player_id;
				
				this.stack_type = STACK_ARMY;
				
				//have the tiles stack on top of each other
				//default functionality for ebg.stock is only to stack vertically or horizontally
				//this.vertical_overlap = 20;
				this.horizontal_overlap = 10;
				this.hide_all_except_top = true;
				this.display_stack_size = true;
				this.items_per_line = 20;
				this.item_margin = 0;
				this.item_width = 99;
				this.item_height = 50;
				this.container_div.style.width = "99px";
				this.applyMapTransformable();
				//this.container_div.style.height = "50px";		//this is automatically overriden
				
				this.setSelectionMode(3);
				this.apparenceBorderWidth = window.gameui.army_selection_border_width;		//note: the default stock handling expects this to be string value eg "5px" but i think ive overwridden it everywhere here
				dojo.style(this.container_div, 'margin', this.apparenceBorderWidth + "px");
				dojo.style(this.container_div, 'zIndex', window.gameui.GameLayerArmy());
				
				//a custom element to hide behind the tiles and show if the stack is selected
				this.selected_div = dojo.place("<div class=\'selected_army_bg\'></div>",this.container_div.id,"first");
				//dojo.style(this.selected_div, 'border', this.apparenceBorderWidth + 'px outset white');
				//dojo.style(this.selected_div, 'borderRadius', this.apparenceBorderWidth + "px");
				dojo.style(this.selected_div, 'left', '-' + this.apparenceBorderWidth + "px");
				dojo.style(this.selected_div, 'top', '-' + this.apparenceBorderWidth + "px");
				
				if(from_div_id != null && typeof from_div_id != 'undefined')
				{
					//console.log("spawning army " + this.id_num + " from_div_id: " + from_div_id);
					window.gameui.placeOnObjectPos(this.container_div.id, from_div_id, this.apparenceBorderWidth, -this.item_height/2);
				}
				//this.SpawnTestUnitsInStack(factionid);
				this.SpawnTilesInStack(army_info["tiles"]);

				//this method will "slide" it out across the board to the starting provine
				window.gameui.MoveArmy(this, army_info.prov_name,  true);
			},
			
			createAsVillage: function(page, host_div_id, village_info)
			{
				//so we can do type checks on generic objects
				Object.getPrototypeOf(this).toString = function tileStackToString()
				{
					return "VillageTileStack";
				};
				this.id_num = village_info.id_num;
				this.id_string = page.GetVillageNameFromId(village_info.id_num);
				this.player_id = village_info.player_id;
				this.create(page, host_div_id);
				//this.container_div.dataset.blstplayerid = village_info.player_id;
				
				this.stack_type = STACK_VILLAGE;
				
				//have the tiles stack on top of each other
				//default functionality for ebg.stock is only to stack vertically or horizontally
				//this.vertical_overlap = 20;
				this.horizontal_overlap = 25;
				//this.items_per_line = 20;
				this.item_margin = 0;
				this.item_width = 99;
				this.item_height = 50;
				this.container_div.style.width = "99px";
				//this.container_div.style.height = "50px";		//this is automatically overriden
				//this.backgroundSize = "100% 100%";
				this.setSelectionMode(3);
				this.applyMapTransformable();
				dojo.style(this.container_div, 'zIndex', window.gameui.GameLayerArmy());
				/*
				this.apparenceBorderWidth = window.gameui.army_selection_border_width;		//note: the default stock handling expects this to be string value eg "5px" but i think ive overwridden it everywhere here
				dojo.style(this.container_div, 'margin', this.apparenceBorderWidth + "px");
				
				//a custom element to hide behind the tiles and show if the stack is selected
				this.selected_div = dojo.place("<div class=\'selected_army_bg\'></div>",this.container_div.id,"first");
				//dojo.style(this.selected_div, 'border', this.apparenceBorderWidth + 'px outset white');
				//dojo.style(this.selected_div, 'borderRadius', this.apparenceBorderWidth + "px");
				dojo.style(this.selected_div, 'left', '-' + this.apparenceBorderWidth + "px");
				dojo.style(this.selected_div, 'top', '-' + this.apparenceBorderWidth + "px");
				*/
				
				/*if(starting_province_id != undefined)
				{
					//todo: why does this function place it in an unusual spot?
					//offset (60,-90) is so it looks like it's coming from the place i want it to (centre of "bag" div)
					//page.placeOnObjectPos(this.container_div, $(starting_province_id), 60, -90);
					page.placeOnObjectPos(this.container_div, $(starting_province_id), 0, 0);
				}*/
				
				//this method will "slide" it out across the board to the starting provine
				window.gameui.MoveArmy(this, village_info.province_name,  true);
			},
			
			applyMapTransformable : function()
			{
				dojo.addClass(this.id_string, "map_army_transformable");
				if(!window.gameui.display_map_stacks)
				{
					dojo.addClass(this.id_string,"display_none");
				}
				dojo.style(this.id_string,"transform", "scale(" + window.gameui.army_tile_scale + ")");
			},
			
			addVillage(new_faction_id)
			{
				var village_type = Number(this.village_tiles_offset) + Number(new_faction_id);
				//console.log("page::addVillage(" + new_faction_id + ") this.village_tiles_offset:" + this.village_tiles_offset + " | village_type:" + village_type);
				//this.addToStock(village_type);
				var prov_id_num = gameui.GetProvinceIdFromName(this.prov_name);
				//this should avoid collisions with tile id numbers... 
				//note that temp army id numbers are negative to avoid clashing with positive army id
				//im handling this in a silly way on the server. it's using a whole different Deck object but they could probably just be merged
				var temp_id = 100 + gameui.getTempArmyId() * -1;	
				var village_tile_info = {id: temp_id, type_arg: village_type};
				this.SpawnTileInStack(village_tile_info);
			},
			
			GenericInitialiseUI : function(page, host_div_id, player_id, tilestack_type)
			{
				//basic settings and creation of parent stock element
				this.id_num = player_id;
				this.player_id = player_id;
				this.stack_type = tilestack_type;
				this.create(page, host_div_id);
				
				//generic initialisation for all tilestacks used in the UI
				//this.item_margin = 15;
				this.item_width = 115;
				this.item_height = 57;
				this.selectable = 0;
				//dojo.style(this.container_div, 'width', "115px");
			},
			
			createAsBattleTilestack : function(page, host_div_id, player_id, tilestack_type, layout_as_attacker)
			{
				//console.log("page::createAsBattleTilestack(" + page + "," + host_div_id + "," + player_id + "," + tilestack_type + "," + layout_as_attacker + ")");
				//pre initialisation
				var container_div_id = "NA";
				switch(tilestack_type)
				{
					case STACK_BATTLE_DISPLAY:
					{
						container_div_id = "battle_display_";
						this.extraClassesContainer += "battle_display ";
						this.custom_item_render_callback = this.renderBattleDisplayTile;
						this.custom_container_height_function = this.BattleDisplayApplyHeight;
						
						break;
					}
					case STACK_BATTLE_TILES:
					{
						container_div_id = "battle_tiles_";
						this.extraClassesContainer += "battle_tiles ";
						break;
					}
					case STACK_BATTLE_TILES_TEMP:
					{
						container_div_id = "battle_temp_";
						this.extraClassesContainer += "battle_temp ";
						break;
					}
					case STACK_BATTLE_TILES_REJECT:
					{
						container_div_id = "battle_reject_";
						this.extraClassesContainer += "battle_reject ";
						this.custom_item_render_callback = this.renderBattleRejectTile;
						break;
					}
				}
				
				//basic settings
				this.ui_attacker_layout = layout_as_attacker;
				this.can_sacrifice = false;
				
				if(this.ui_attacker_layout)
				{
					container_div_id += "attacker";
					this.extraClassesContainer += "battle_attacker ";
				}
				else
				{
					container_div_id += "defender";
					this.extraClassesContainer += "battle_defender ";
				}
				this.id_string = container_div_id;
				
				//mid initialisation
				this.GenericInitialiseUI(page, host_div_id, player_id, tilestack_type);
				
				//some common settings
				this.items_per_line = 20;
				this.horizontal_overlap = 30;
				//this.item_margin = 0;
				this.spawn_fadein = false;
				this.spawn_fadeout = false;
				
				//post initialisation
				switch(tilestack_type)
				{
					case STACK_BATTLE_DISPLAY:
					{
						this.items_per_line = 1;
						dojo.style(this.container_div, 'position', "relative");
						this.selectable = 1;
						break;
					}
					case STACK_BATTLE_TILES_TEMP:
					{
						this.selectable = 1;
						//fall through
					}
					case STACK_BATTLE_TILES_REJECT:
					{
						//fall through
					}
					case STACK_BATTLE_TILES:
					{
						this.centerItems = true;
						this.item_width = 80;
						this.item_height = 40;
						this.items_per_line = 20;
						this.horizontal_overlap = 0;
						//this.item_margin = 0;
						this.spawn_fadein = false;
						this.spawn_fadeout = false;
						dojo.style(this.container_div, 'position', "relative");
						break;
					}
				}
			},
			
			createAsUITilestack : function(page, host_div_id, player_id, tilestack_type)
			{
				//pre initialisation
				var container_div_id;
				switch(tilestack_type)
				{
					case STACK_PLAYERHAND:
					{
						container_div_id = "player_hand";
						this.item_margin = 5;
						break;
					}
					case STACK_PAYMENT:
					{
						container_div_id = "paystack";
						break;
					}
					case STACK_ARMY_SELECTED:
					{
						container_div_id = page.GetArmySelectionStackDivId();
						break;
					}
					case STACK_OTHERUNITS:
					{
						container_div_id = page.GetOtherUnitsStackDivId();
						break;
					}
				}
				this.id_string = container_div_id;
				
				//mid initialisation
				this.GenericInitialiseUI(page, host_div_id, player_id, tilestack_type);
				
				//post initialisation
				switch(tilestack_type)
				{
					case STACK_PLAYERHAND:
					{
						this.items_per_line = 2;
						this.selectable = 2;
						this.selectionApparance = 'striped';
						break;
					}
					case STACK_ARMY_SELECTED:
					{
						this.items_per_line = 1;
						this.selectable = 2;
						this.selectionApparance = 'striped';
						this.custom_item_render_callback = this.renderTileSelectedArmy;
						this.custom_item_item_remove_callback = this.onItemRemoveSelectedArmy;
						this.spawn_fadein = false;
						this.spawn_fadeout = false;
						break;
					}
					case STACK_OTHERUNITS:
					{
						this.items_per_line = 2;
						this.selectable = 2;
						this.spawn_fadein = false;
						this.spawn_fadeout = false;
						break;
					}
					case STACK_PAYMENT:
					{
						this.items_per_line = 20;
						this.horizontal_overlap = 30;
						//this.item_margin = 0;
						this.spawn_fadein = false;
						this.spawn_fadeout = false;
						this.selectable = 1;
						break;
					}
				}
			},
			
			createAsPlayerHand: function(page, host_div_id, player_id)
			{
				this.createAsUITilestack(page, host_div_id, player_id, STACK_PLAYERHAND);
			},
			
			createAsArmySelection: function(page, host_div_id, parent_army)
			{
				//console.log("Tilestack::createAsArmySelection({page}, " + host_div_id + "," + " {parent_army})");
				//console.log(parent_army);
				//create the basic structure
				this.createAsUITilestack(page, host_div_id, parent_army.player_id, STACK_ARMY_SELECTED);
				
				//shuffle down slightly so we dont overlap the army title text
				//this is a hack but oh well
				//console.log(this.container_div);
				//this.container_div.top = "75px";
				
				//copy tiles from army stack
				this.copyAcrossParentTiles(parent_army);
				
				if(window.gameui.isCurrentPlayerMoveMode() && window.gameui.getActivePlayerId() == this.player_id)
				{
					//select all tiles
					this.selectAll();
				}
			},
			
			createAsOtherUnits : function(page, host_div_id, player_id)
			{
				this.createAsUITilestack(page, host_div_id, player_id, STACK_OTHERUNITS);
			},
			
			createAsPaystack: function(page, host_div_id, player_id)
			{
				this.createAsUITilestack(page, host_div_id, player_id, STACK_PAYMENT);
			},
			
			createAsBattleDisplay: function(page, host_div_id, player_id, layout_as_attacker = false)
			{
				//console.log("page::createAsBattleDisplay(" + page + "," + host_div_id + "," + player_id + "," + layout_as_attacker + ")");
				this.createAsBattleTilestack(page, host_div_id, player_id, STACK_BATTLE_DISPLAY, layout_as_attacker);
			},
			
			createAsBattleTiles: function(page, host_div_id, player_id, layout_as_attacker = false)
			{
				this.createAsBattleTilestack(page, host_div_id, player_id, STACK_BATTLE_TILES, layout_as_attacker);
			},
			
			createAsBattleTilesTemp: function(page, host_div_id, player_id, layout_as_attacker = false)
			{
				this.createAsBattleTilestack(page, host_div_id, player_id, STACK_BATTLE_TILES_TEMP, layout_as_attacker);
			},
			
			createAsBattleTilesReject: function(page, host_div_id, player_id, layout_as_attacker = false)
			{
				this.createAsBattleTilestack(page, host_div_id, player_id, STACK_BATTLE_TILES_REJECT, layout_as_attacker);
			},
			
			renderBattleRejectTile: function(item)
			{
				var item_id = this.getItemDivId( item.id );
				var item_div = dojo.byId(item_id);
				dojo.style(item_div, "opacity", "50%");
			},
			
			renderBattleDisplayTile: function(item)
			{
				//console.log("renderBattleDisplayTile");
				//console.log(item);
				
				var is_attacker = this.ui_attacker_layout;
				var node_id = this.getTilebonusItemDivId(item);
				var node_tilebonus = dojo.byId(node_id);
				var div_container = dojo.byId(this.id_string);
				if(!node_tilebonus)
				{
					node_tilebonus = dojo.place("<div id=\"" + node_id + "\"class=\"battle_display_tilebonus\"></div>", div_container);
					//what is the combat bonus for this fight?
					var tilebonus_amount = window.gameui.getTileCombatBonus(Number(item.type), this.player_id, is_attacker);
					//console.log("tilebonus_amount: " + tilebonus_amount);
					if(tilebonus_amount != 0)
					{
						node_tilebonus.innerHTML = "+" + tilebonus_amount;
					}
					
					//this is possibly hacky putting it here, but it seems to work nicely in testing
					//because this is only on creation of this ui element, it only gets added to the total once
					window.gameui.addBattlescore(tilebonus_amount, this.player_id)
				}
				var item_id = this.getItemDivId( item.id );
				var item_div = dojo.byId(item_id);
				var item_marginBox = dojo.marginBox(item_div);
				var newTop = item_marginBox.t + 14;
				node_tilebonus.style.top = newTop + "px";
				var newLeft = item_marginBox.l;
				
				//render them all to the left for now
				if(is_attacker || true)
				{
					newLeft += (this.item_width + 10);
				}
				else
				{
					newLeft -= 40;
				}
				node_tilebonus.style.left = newLeft + "px";
			},
			
			getTilebonusContainerDivId : function(item)
			{
				return "battle_display_tilebonus_" + this.player_id;
			},
			
			getTilebonusItemDivId : function(item)
			{
				//it's possible for tile ID clashes to happen across different player decks
				//so far it hasn't been an issue up until now
				//combining player id and tile id will create a unique identifier
				return "battle_display_tilebonus_" + this.player_id + "_" + item.id;
			},
			
			getStackSizeDivId : function()
			{
				return this.id_string + "_stacksize";
			},
			
			destroy_self: function()
			{
				//todo: this is untested and could lead to memory leaks
				//console.log("TileStack::Destroy()");
				//console.log(this.tiles);
				for(var i in this.tiles)
				{
					//console.log(this.tiles[i]);
					delete this.tiles[i];
					this.tiles[i] = null;
				}
				//console.log(this.tiles);
				
				delete this.tiles;
				this.tiles = null;
				this.inherited(arguments);
				//console.log("TileStack::Destroy() finished");
			},
			
			attachToNewParentNoDestroy: function (mobile_in, new_parent_in, relation, place_position) {
				//console.log("TileStack::attachToNewParentNoDestroy(" + mobile_in + "," + new_parent_in + ")");
				const mobile = $(mobile_in);
				//console.log(mobile);
				const new_parent = $(new_parent_in);
				//console.log(new_parent);

				var src = dojo.position(mobile);
				if (place_position)
				{
					mobile.style.position = place_position;
				}
				dojo.place(mobile, new_parent, relation);
				mobile.offsetTop;//force re-flow
				var tgt = dojo.position(mobile);
				var box = dojo.marginBox(mobile);
				var cbox = dojo.contentBox(mobile);
				var left = box.l + src.x - tgt.x;
				var top = box.t + src.y - tgt.y;

				mobile.style.position = "absolute";
				mobile.style.left = left + "px";
				mobile.style.top = top + "px";
				box.l += box.w - cbox.w;
				box.t += box.h - cbox.h;
				mobile.offsetTop;//force re-flow
				return box;
			},
			
			addItemType: function( type, weight, image, image_position )
			{
				//console.log("DEBUG addItemType(" + type + "," + weight + "," + image + "," + image_position + ")");
				/*
				if( ! image_position )
				{   image_position = 0; }
				this.item_type[ type ] = { weight: toint(weight), image: image, image_position: image_position };
				*/
				this.inherited(arguments);
			},
			
			SpawnTilesInStack : function(tile_infos, source_div_id = undefined, selected = true)
			{
				//console.log("page::SpawnTilesInStack()");
				//console.log(tile_infos);
				for(var i in tile_infos)
				{
					var tile_info = tile_infos[i];
					this.SpawnTileInStack(tile_info, source_div_id, selected);
				}
			},
			
			SpawnTileInStack : function(tile_info, source_div_id = undefined, selected = true)
			{
				if(source_div_id == "from item div")
				{
					//console.log("army::SpawnTileInStack(" + tile_info.id + ", \"from item div\", " + selected + ")");
					//console.log(tile_info);
					//console.log(this.control_name);
					//console.log(this.container_div);
					source_div_id = tile_info.div_id;
				}
				this.addToStockWithId(tile_info.type_arg, tile_info.id, source_div_id);
				this.tiles[tile_info.id.toString()] = tile_info;
				//tile_info.selected = selected;
				
				//this doesnt work... tile_node is null because it's a delayed creation. have to allow current query to resolve first
				//could rewrite stock further but i dont think it's worth it
				//var tile_node = dojo.byId(tile_info.id);
				//tile_node.draggable = true;
			},
			
			RemoveTilesFromStack : function(tile_infos, target_div_id = undefined)
			{
				for(var i in tile_infos)
				{
					var tile_info = tile_infos[i];
					this.RemoveTileFromStack(tile_info.id, target_div_id);
				}
			},
			
			RemoveTilesFromStackIds : function(tile_ids, target_div_id = undefined)
			{
				for(var i in tile_ids)
				{
					var tile_id = tile_ids[i];
					this.RemoveTileFromStack(tile_id, target_div_id);
				}
			},
			
			// Internal method to remove an item at a specific position
			// If "to" is specified: move item to this position before destroying it
			_removeFromStockItemInPosition: function( i, to, noupdate )
			{
				var destroyElementFromStock = function ( node ) { dojo.destroy( node ); };
				var item = this.items[ i ];
				
				// Item deletion hook (allow user to perform some additional item delete operation)
				if( this.onItemDelete )
				{   this.onItemDelete( this.getItemDivId( item.id ), item.type, item.id );  }
				
				this.items.splice( i, 1 );

				// Trigger immediately the disappearance of corresponding item
				var item_id = this.getItemDivId( item.id );
				this.unselectItem( item.id );
				item_div = $( item_id );
				var fadeout_duration = 500;
				if(!this.spawn_fadeout)
				{
					fadeout_duration = 0;
				}
				if(typeof to != 'undefined')
				{
					var anim = dojo.fx.chain([
						
						this.page.slideToObject( item_div, to ),
						
						dojo.fadeOut( { node:  item_div,
										duration: fadeout_duration,
										onEnd: destroyElementFromStock
								  } )
					]).play();
				}
				else
				{
					
					dojo.fadeOut( { node:  item_div,
										duration: fadeout_duration,
									onEnd: destroyElementFromStock
								  } ).play();
				}
				dojo.addClass( item_div, 'to_be_destroyed' );

				if (noupdate !== true) {
					this.updateDisplay();
				}
			},
			RemoveTileFromStack : function(tile_info_id, target_div_id = undefined)
			{
				//console.log("tilestack::RemoveTileFromStack(" + tile_info_id + "," + target_div_id + ")");
				this.removeFromStockById(tile_info_id, target_div_id);
				delete this.tiles[tile_info_id.toString()];
				
				if(this.custom_item_item_remove_callback != null)
				{
					this.custom_item_item_remove_callback(tile_info_id);
				}
			},
			
			RemoveAllTilesFromStack : function(target_div_id = undefined)
			{
				//console.log("tilestack::RemoveAllTilesFromStack(" + target_div_id + ")");
				while(this.items.length > 0)
				{
					var tile_info = this.items[0];
					this.RemoveTileFromStack(tile_info.id, target_div_id);
				}
			},
			
			GetTileInfo : function(tile_info_id)
			{
				return this.tiles[tile_info_id.toString()];
			},
			
			IsStackEmpty : function()
			{
				//tiles is an object so we can do for..in loop as an easy way to check if it has any contents
				for(var i in this.tiles)
				{
					//literally any contents means it is not empty
					return false;
				}
				
				//we didnt find any tile_infos so we must be empty
				return true;
			},
			
			GetNumItems : function()
			{
				return this.items.length;
			},
			
			IsTempStack : function()
			{
				return window.gameui.isTempArmy(this);
			},
			
			//no longer used, left in for debugging etc
			SpawnTestUnitsInStack : function(faction_id)
			{
				if(this.stack_type != STACK_ARMY)
				{
					console.log("ERROR: not an army stack! Stack type is: " + this.stack_type);
					return;
				}
				var faction_offset = faction_id * this.image_items_per_row;
				
				//add a hand of tiles for testing
				
				//preset tiles
				/*
				this.addToStock(faction_offset + 4, "bag");
				this.addToStock(faction_offset + 5, "bag");
				this.addToStock(faction_offset + 6, "bag");
				*/
				
				//random set of tiles
				for(let i = 0; i < 3; i++)
				{
					//pick a random tile
					var tile_type = faction_offset + Math.floor(Math.random() * (this.image_items_per_row));
					//console.log("DEBUG spawning tile_type:" + tile_type);
					
					//spawn it in
					//note: the final arg is the div id of a source element
					//the spawned tile should slide from the source element to our stack container element
					
					//note: eventually we should use addToStockWithId to track each individual tile
					//for now while we are testing just use addToStock
					this.addToStock(tile_type);
					
					//domClass.add("someNode", "newClass");
				}
				
				//debug
				/*for(let item in this.items)
				{
					var item_div_id = this.getItemDivId(item.id);
					console.log("checking div " + item_div_id);
					var item_div = $(item_div_id);
					console.log(item_div);
				}*/
				//console.log(this);
			},
			
			getSelectedTileIds : function()
			{
				var selected_tile_ids = [];
				var selected_items = this.getSelectedItems();
				for(var i in selected_items)
				{
					var item = selected_items[i];
					selected_tile_ids.push(item.id);
				}
				/*
				for(var i in this.tiles)
				{
					var tile = this.tiles[i];
					if(tile.selected)
					{
						selected_tile_ids.push(tile.id);
					}
				}
				*/
				return selected_tile_ids;
			},
			
			getUnselectedTileIds : function()
			{
				var unselected_tile_ids = [];
				var unselected_items = this.getUnselectedItems();
				for(var i in selected_items)
				{
					var item = selected_items[i];
					unselected_tile_ids.push(item.id);
				}
				/*
				for(var i in this.tiles)
				{
					var tile = this.tiles[i];
					if(!tile.selected)
					{
						selected_tile_ids.push(tile.id);
					}
				}
				*/
				return unselected_tile_ids;
			},
			
			getTileInfos : function(include_div_id = false)
			{
				var tile_infos = [];
				for(var i in this.tiles)
				{
					var tile = this.tiles[i];
					if(include_div_id)
					{
						tile.div_id = this.getItemDivId(tile.id);
					}
					tile_infos.push(tile);
				}
				return tile_infos;
			},
			
			StartQueuedMove : function()
			{
				//console.log("page::StartQueuedMove() this.prov_name:" + this.prov_name);
				this.starting_province_location = this.prov_name;
				window.gameui.queued_moving_armies.push(this);
			},
			
			EndQueuedMove : function()
			{
				//console.log("page::EndQueuedMove()");
				this.starting_province_location = null;
			},
			
			CanArmySeaMove : function()
			{
				if(this.stack_type = STACK_ARMY)
				{
					for(var index in this.items)
					{
						var item = this.items[index];
						if(!this.isSelected(item.id))
						{
							continue;
						}
						if(!window.gameui.IsTileTypeShip(item.type) && !window.gameui.IsTileTypeDragon(item.type))
						{
							return false;
						}
					}
					return true;
				}
				return false;
			},
			
			CanArmyShipMove : function()
			{
				return !this.DoesArmyContainShip();
			},
			
			DoesArmyContainShip : function()
			{
				//small helper function to determine between armies without ships and armies with ships
				//note: armies with ships will consist only of ships. there can be no mixed armies with ships and non-ships
				//todo: what about dragons?
				if(this.stack_type = STACK_ARMY)
				{
					for(var index in this.items)
					{
						var item = this.items[index];
						if(!this.isSelected(item.id))
						{
							continue;
						}
						if(window.gameui.IsTileTypeShip(item.type))
						{
							return true;
						}
					}
				}
				return false;
			},
			
			DoesArmyContainNonUndead : function()
			{
				if(this.stack_type = STACK_ARMY)
				{
					for(var index in this.items)
					{
						var item = this.items[index];
						if(!this.isSelected(item.id))
						{
							continue;
						}
						if(!window.gameui.IsTileTypeUndead(item.type))
						{
							return true;
						}
					}
				}
				return false;
			},
			
			DoesArmyContainUndead : function()
			{
				if(this.stack_type = STACK_ARMY)
				{
					for(var index in this.items)
					{
						var item = this.items[index];
						if(!this.isSelected(item.id))
						{
							continue;
						}
						if(window.gameui.IsTileTypeUndead(item.type))
						{
							return true;
						}
					}
				}
				return false;
			},
			
			UndeadMovesRemaining : function()
			{
				if(this.DoesArmyContainNonUndead() || !this.DoesArmyContainUndead())
				{
					return 0;
				}
				
				//max of 2 
				var moves_left = 2;
				if(window.gameui.queued_undead_moves[this.id_string])
				{
					var moves = window.gameui.queued_undead_moves[this.id_string];
					moves_left -= moves.length;	//the starting province increases this array size by 1
					moves_left += 1;
				}
				
				return moves_left;
			},
			
			CanArmyUseShipMovement : function()
			{
				return !this.DoesArmyContainShip();
			},
			
			GetNumLeaders : function()
			{
				var num_leaders = 0;
				if(this.stack_type == STACK_ARMY)
				{
					for(var index in this.items)
					{
						var item = this.items[index];
						if(!this.isSelected(item.id))
						{
							continue;
						}
						if(window.gameui.IsTileTypeLeader(item.type))
						{
							num_leaders++;
						}
					}
				}
				return num_leaders;
			},
			
			SetGhosted : function(is_ghosted)
			{
				//console.log("page::SetGhosted(" + is_ghosted + ") " + this.id_string);
				if(is_ghosted)
				{
					switch(this.stack_type)
					{
						case STACK_ARMY:
						{
							window.gameui.ghosted_armies.push(this);
							break;
						}
					}
				}
				this.ghosted = is_ghosted;
				this.updateDisplay();
			},
			
			IsBuilding : function()
			{
				return this.isBuilding;
			},
			
			IsMoving : function()
			{
				return this.isMoving;
			},
			
			isGhosted : function()
			{
				return this.ghosted;
			},
			
			SetBuilding : function(is_building)
			{
				this.SetGhosted(is_building);
				this.isBuilding = is_building;
				if(this.isBuilding)
				{
					this.spawn_fadein = false;
				}
			},
			
			SetMoving : function(is_moving)
			{
				this.SetGhosted(is_moving);
				this.isMoving = is_moving;
				if(this.is_moving)
				{
					this.spawn_fadein = false;
				}
			},
			
			IsCitadelPresent : function()
			{
				//console.log("Tilestack::IsCitadelPresent() id_string:" + this.id_string);
				for(var i in this.tiles)
				{
					var tile_info = this.tiles[i];
					console.log(tile_info);
					if(window.gameui.IsTileTypeCitadel(tile_info.type_arg))
					{
						return true;
					}
				}
				return false;
			},
			
			IsCastlePresent : function()
			{
				for(var i in this.tiles)
				{
					var tile_info = this.tiles[i];
					console.log(tile_info);
					if(window.gameui.IsTileTypeCastle(tile_info.type_arg))
					{
						return true;
					}
				}
				return false;
			},
			
			updateDisplay : function( from )
			{
				//we are overriding a few specific settings here necessary for our stack types
				//i wish i didnt have to override this whole function because there is only small tweaks i want to make
				
				//console.log("page::updateDisplay() " + this.control_name + " | this.stack_type: " + this.stack_type);
				//this.inherited(arguments);
				//return;
				
			  //  console.log( "stock::updateDisplay" );
				if( ! $(this.control_name) )
				{   return; }   // Stock object has been removed
				
				var controlCoords = dojo.marginBox( this.control_name );

				var item_visible_width = this.item_width;
				var item_visible_width_lastitemlost = 0;
				var itemIndex = 'auto';
				if(this.hide_all_except_top)
				{
					itemIndex = 1;
					item_visible_width = 0;
				}
				else if( this.horizontal_overlap != 0 )
				{
					item_visible_width = Math.round( this.item_width*this.horizontal_overlap/100 );
					item_visible_width_lastitemlost = this.item_width - item_visible_width;
					itemIndex = 1;//window.gameui.GameLayerArmy() + 1;
				}
				var vertical_overlap_px = 0;
				if( this.vertical_overlap != 0 )
				{
					vertical_overlap_px = Math.round( this.item_height*this.vertical_overlap/100 ) * (this.use_vertical_overlap_as_offset ? 1 : -1);
				}
			  //  console.log( controlCoords );
				
				var control_width = controlCoords.w;
				if( this.autowidth )
				{
					var parentControlCoords = dojo.marginBox( $('page-content') );
					control_width = parentControlCoords.w;
					console.log( "autowidth with width="+control_width );
				}

				var currentTop = 0;
				var currentLeft = 0;
				var nbrLines = 0;
				var perLines = this.items_per_line;//Math.max( 1, Math.floor( (control_width-item_visible_width_lastitemlost) / ( item_visible_width + this.item_margin ) ) );
				var lastLine = 0;
				var control_new_width = 0;
				var n=0;
				
				//if(this.stack_type == STACK_ARMY_SELECTED)	console.log("updateDisplay()");
				
				for( var i in this.items )
				{
					var item = this.items[ i ];
					//if(this.stack_type == STACK_ARMY_SELECTED)	console.log(item);
					
					var item_id = this.getItemDivId( item.id );
					if( itemIndex != 'auto' )
					{
						itemIndex++;
					}
				  //  console.log( "item: "+item_id );

					if( typeof item.loc == 'undefined' )
					{                
						var itemLine = Math.floor( n/perLines );
						lastLine = Math.max( lastLine, itemLine );
						
						currentTop = lastLine * ( this.item_height+vertical_overlap_px + this.item_margin );
						currentLeft = ( n-lastLine*perLines )*( item_visible_width + this.item_margin );
						control_new_width = Math.max( control_new_width, currentLeft + item_visible_width );
						//console.log("test: " + currentTop + " | " + lastLine + " | " + this.item_height + " | " + vertical_overlap_px + " | " + this.item_margin);

						if( this.vertical_overlap != 0 && n%2==0 && this.use_vertical_overlap_as_offset)
						{
							// Vertical overlap for odd cards
							currentTop += vertical_overlap_px;
						}
						
						// Centering if asked
						if (this.centerItems) {
							var nbr_in_line = (itemLine == Math.floor( this.count()/perLines ) ? this.count() % perLines : perLines);
							currentLeft += (control_width - nbr_in_line * (item_visible_width + this.item_margin)) / 2;
						}

						n++; 
					}
					else
					{
						// Item should be displayed at a specific location
					}
					
					var item_div = $( item_id );
					if( item_div )
					{
						if( typeof item.loc == 'undefined' )
						{
							// Item already exists => move it to its new location
							dojo.fx.slideTo( {  node: item_div,
												top: currentTop,
												left: currentLeft,
												duration: this.duration,
												unit: "px" } ).play();
							//dojo.addClass( item_div, 'tile_refund_anim' );	//this doesn't appear to have the desired effect
						}
						else
						{
							this.page.slideToObject( item_div, item.loc, this.duration ).play();                        
						}
						
						if( itemIndex != 'auto' )
						{
							dojo.style( item_div, 'zIndex', itemIndex );
						}
					}
					else
					{
						// Item does not exist => create it
					  //  console.log( "create item" );
						var type = this.item_type[ item.type ];
						if( ! type )
						{
							console.error( "Stock control: Unknow type: "+type );
						}
						if( typeof item_id == 'undefined'  )
						{
							console.error( "Stock control: Undefined item id" );
						}
						else if( typeof item_id == 'object' )
						{
							console.error( "Stock control: Item id with 'object' type" );
							console.error( item_id );
						}
						
						additional_style = '';
						if( this.backgroundSize !== null )
						{   additional_style += 'background-size:'+this.backgroundSize; }
						
						var item_html = dojo.trim( dojo.string.substitute( this.jstpl_stock_item, {
																								id: item_id,
																								width: this.item_width,
																								height: this.item_height,
																								top: currentTop,
																								left: currentLeft,
																								image: type.image,
																								position: ( itemIndex=='auto' ) ? '' : ( 'z-index:'+itemIndex ),
																								extra_classes: this.extraClasses,
																								additional_style: additional_style
																							} ) );

						dojo.place( item_html, this.control_name );

						item_div = $( item_id );
						
						//player hand tiles are draggable
						if(this.stack_type == STACK_PLAYERHAND)
						{
							//item_div.draggable = true;
							item_div.draggable = true;
							item_div.ondragstart = window.gameui.callback_HandTileDragStart;
							item_div.ondragend = window.gameui.callback_HandTileDragEnd;
							item_div.ondrop = window.gameui.callback_HandTileDrop;
						}

						if( typeof item.loc != 'undefined' )
						{
							this.page.placeOnObject( item_div, item.loc );
						}

						if( this.selectable == 0 )
						{
							dojo.addClass( item_div, 'stockitem_unselectable' );
						}
						

						dojo.connect(item_div, "onclick", this, 'onClickOnItem');
						
						if( toint( type.image_position ) !== 0 )
						{
							var img_dx=0;
							var img_dy=0;
							if( this.image_items_per_row )
							{
								// Several rows
								var row = Math.floor( type.image_position / this.image_items_per_row );
								if( ! this.image_in_vertical_row )
								{
									img_dx = ( type.image_position - ( row*this.image_items_per_row ) ) * 100;
									img_dy = row * 100;
								}
								else
								{
									img_dy = ( type.image_position - ( row*this.image_items_per_row ) ) * 100;
									img_dx = row * 100;
								}
								dojo.style( item_div, "backgroundPosition", "-"+img_dx+"% -"+img_dy+"%" );
							}
							else
							{
								// All in one row
								img_dx = type.image_position * 100;
								dojo.style( item_div, "backgroundPosition", "-"+img_dx+"% 0%" );
							}
						
						}
						
						// Item creation hook (allow user to perform some additional item creation operation)
						if( this.onItemCreate )
						{   this.onItemCreate( item_div, item.type, item_id );  }
						
						if(typeof from != 'undefined' && from != null)
						{
							//console.log("from:" + from);
							this.page.placeOnObject( item_div, from );

							if( typeof item.loc == 'undefined' )
							{
								var anim = dojo.fx.slideTo( {  node: item_div,
													top: currentTop,
													left: currentLeft,
													duration: this.duration,
													unit: "px" } );
													
								anim = this.page.transformSlideAnimTo3d( anim, item_div, this.duration, null );
								anim.play();

							}
							else
							{
								this.page.slideToObject( item_div, item.loc, this.duration ).play();
							}
						}
						else if(this.spawn_fadein)
						{
							dojo.style( item_div, "opacity", 0 );
							dojo.fadeIn( {node:  item_div } ).play();
						}
						else
						{
							//console.log("from is undefined or null");
						}
					}
					
					if(this.ghosted)
					{
						dojo.style( item_div, "opacity", 0.7);
					}
					else
					{
						dojo.style( item_div, "opacity", 1);
					}
					
					if(this.custom_item_render_callback != null)
					{
						this.custom_item_render_callback(item);
					}
				}
				
				var control_height = (lastLine+1) * ( this.item_height + vertical_overlap_px + this.item_margin );
				if(this.custom_container_height_function)
				{
					this.custom_container_height_function(control_height);
				}
				else
				{
					dojo.style( this.control_name, 'height', control_height+'px' );
				}
				
				if( this.autowidth )
				{
					if( control_new_width>0 )
					{
						control_new_width += ( this.item_width - item_visible_width );
					}
					dojo.style( this.control_name, 'width', control_new_width+'px' );
				}
				
				if(this.display_stack_size)
				{
					var stack_size_div_id = this.getStackSizeDivId();
					var stack_size_div = $( stack_size_div_id );
					if(this.items.length > 1)
					{
						if(!stack_size_div)
						{
							stack_size_div = dojo.place("<div id=\"" + stack_size_div_id + "\" class=\"army_stack_size_display\"></div>",this.container_div.id,"first");
						}
						dojo.style(stack_size_div, 'zIndex', this.items.length + 2);
						stack_size_div.innerHTML = "x" + this.items.length;
					}
					else if(stack_size_div)
					{
						dojo.destroy(stack_size_div_id);
					}
				}
			},
			
			BattleDisplayApplyHeight : function(control_height)
			{
				dojo.style( this.control_name,'height','100%');
			},
			
			removeFromStockById: function( id, to, noupdate )
			{
				for( var i in this.items )
				{
					var item = this.items[ i ];
					if( item.id == id )
					{
						this._removeFromStockItemInPosition( i, to, noupdate );
						
						//this.addToStockWithId(spawn_tile.type_arg, spawn_tile.id);
						delete this.tiles[item.id.toString()];
						//this.tiles[spawn_tile.id.toString()] = spawn_tile;
						return true;
					}   
				}
				
				return false;
			},
			
			HasTile : function(tile_id)
			{
				for(var index in this.items)
				{
					var item = this.items[index];
					if(Number(item.id) == Number(tile_id))
					{
						return true;
					}
				}
				return false;
			},
			
			// User clicks on a stock item
			onClickOnItem: function(event)
			{
				//console.log("TileStack::onClickOnItem() this.stack_type:" + this.stack_type + " | this.selectable:" + this.selectable);
				//console.log(event);
				event.stopPropagation();
				
				//ignore clicks if the stack is not selectable
				//todo: i think this may cause some bugs because im adding this functionality somewhat late
				if(this.selectable == 0)
				{
					console.log("Warning: onClickOnItem() this tilestack has selectable == 0");
					return;
				}
				
				switch(this.stack_type)
				{
					case STACK_ARMY:
					{
						//army stack (normal)
						//pass it on to ebg.page to handle army selection
						this.page.onClickArmyStack(event, this);
						break;
					}
					case STACK_ARMY_CASTLE:
					{
						//army stack (with castles)
						//pass it on to ebg.page to handle army selection
						this.page.onClickArmyStack(event, this);
						break;
					}
					case STACK_ARMY_CITADEL:
					{
						//army stack (with citadels)
						//pass it on to ebg.page to handle army selection
						this.page.onClickArmyStack(event, this);
						break;
					}
					case STACK_ARMY_SELECTED:
					{
						this.page.onClickArmySelectedTile(event);
						break;
					}
					case STACK_OTHERUNITS:
					{
						this.page.onClickOtherUnitsTile(event);
						break;
					}
					case STACK_PLAYERHAND:
					{
						//console.log("Warning: onClickOnItem() STACK_PLAYERHAND should be unreachable");
						var prefix_length = ( this.control_name+'_item_' ).length;
						var item_id = event.currentTarget.id.substr( prefix_length );

						if(this.isSelected(item_id))
						{
							this.unselectItem(item_id);
						}
						else
						{
							if(this.selectable === 1)
							{
								this.unselectAll(); 
							}
							this.selectItem(item_id);
						}
						break;
					}
					case STACK_PAYMENT:
					{
						//console.log(event);
						var item_id = event.target.id.substring(14);
						var tile_info = window.gameui.current_player_paystack.GetTileInfo(item_id);
						window.gameui.RefundPaystackTile(tile_info);
						break;
					}
					case STACK_BATTLE_TILES_TEMP:
					{
						var item_id = event.target.id.substring(26);
						var tile_info = window.gameui.current_player_paystack.GetTileInfo(item_id);
						window.gameui.RefundPaystackTile(tile_info);
						break;
					}
					case STACK_BATTLE_DISPLAY:
					{
						if(this.can_sacrifice)
						{
							var item_id = event.target.id.substring(29);
							//console.log(item_id);
							var tile_info = this.GetTileInfo(item_id);
							//console.log(tile_info);
							window.gameui.TrySacrificeArmyTile(tile_info);
						}
						break;
					}
					case STACK_VILLAGE:
					{
						window.gameui.onClickVillageStack(event, this);
						break;
					}
					default:
					{
						//console.log("stack" + this.id_num + "::onClickOnItem()");
						if( this.selectable == 3 )
						{
							this.toggleSelectStack();
							
							//default behaviour for ebg.stock
							/*
							var prefix_length = ( this.control_name+'_item_' ).length;
							var item_id = event.currentTarget.id.substr( prefix_length );
							
							if( this.isSelected( item_id ) )
							{    this.unselectItem( item_id );  }
							else
							{
								if( this.selectable === 1 )
								{   this.unselectAll(); }                    
								this.selectItem( item_id );
							}
							this.onChangeSelection( this.control_name, item_id );
							*/                   
						}
						break;
					}
				}
			},
			
			addItemDivClass : function(class_name)
			{
				//console.log("tilestack::addItemDivClass(" + class_name + ")");
				//console.log(this);
				for(var i in this.items)
				{
					var item = this.items[ i ];
					var item_id = this.getItemDivId( item.id );
					//var item_div = $( item_id );
					dojo.addClass(item_id, class_name);
				}
			},
			
			removeItemDivClass : function(class_name)
			{
				for(var i in this.items)
				{
					var item = this.items[ i ];
					var item_id = this.getItemDivId( item.id );
					//var item_div = $( item_id );
					dojo.removeClass(item_id, class_name);
				}
			},
			
			toggleSelectStack: function()
			{
				if(this.stack_is_selected)
				{
					this.unselectStack();
				}
				else
				{
					this.selectStack();
				}
			},
			
			// Select item with specified id (raw method)
			selectStack: function()
			{
				//console.log("Tilestack:selectStack()");
				if(this.selectable == 3)
				{
					if(this.selected_div)
					{
						//console.log("stack" + this.id_num + "::selectStack()");
						
						//console.log("this.selected_opacity:" + this.selected_opacity);
						dojo.style(this.selected_div, 'opacity', this.selected_opacity);
						
						if(this.selected_div)
						{
							var select_box_width = this.item_width + this.apparenceBorderWidth*2;
							if(this.items.length >= 1 && !this.display_stack_size)
							{
								select_box_width += this.horizontal_overlap * (this.items.length - 1);
								select_box_width += this.vertical_overlap * (this.items.length - 1);
							}
							var select_box_height = this.item_height + this.apparenceBorderWidth*2;
							dojo.style(this.selected_div, 'width', select_box_width + 'px');
							dojo.style(this.selected_div, 'height', select_box_height + 'px');
							
							//console.log(this.container_div.id + " selection box dims: " + select_box_width + "," + select_box_height);
						}
						this.stack_is_selected = true;
					}
				}
				else if(this.selectable == 3)
				{
					//
				}
				else
				{
					this.inherited(arguments);
				}
			},
			
			renderTileSelectedArmy : function(render_item_info)
			{
				//console.log("Tilestack::renderTileSelectedArmy(render_item_info)");
				var item_id = this.getItemDivId( render_item_info.id );
				var item_div = dojo.byId(item_id);
				
				item_div.style.position = "static";
				
				//some useful strings
				var tile_strings = this.page.all_tile_strings[render_item_info.type];
				
				//check if it exists first
				var title_div_id = this.getItemTitleId(render_item_info);
				if(!dojo.byId(title_div_id))
				{
					//name of this tile
					dojo.place("<div id=\"" + title_div_id + "\" class=\"army_selection_element army_item_title\">" + tile_strings.name + "</div>",item_div,"before");
				}
				
				//check if it exists first
				var desc_div_id = this.getItemDescId(render_item_info);
				if(!dojo.byId(desc_div_id))
				{
					//text description of this tile 
					dojo.place("<div id=\"" + desc_div_id + "\" class=\"army_selection_element army_item_desc\">" + tile_strings.desc + "</div>",item_div,"after");
				}
			},
			
			onItemRemoveSelectedArmy : function(item_id)
			{
				var desc_div_id = this.getItemDescId({id: item_id});
				dojo.destroy(desc_div_id);
				var title_div_id = this.getItemTitleId({id: item_id});
				dojo.destroy(title_div_id);
			},
			
			copyAcrossParentTiles : function(parent_army)
			{
				//console.log("page::copyAcrossParentTiles(" + parent_army.id_string + ") into " + this.id_string);
				//console.log(parent_army);
				//console.log(this);
				this.SpawnTilesInStack(parent_army.tiles, null, false);
			},
			
			getItemTitleId : function(item)
			{
				var item_id = this.getItemDivId( item.id );
				var title_div_id = item_id + "_title";
				return title_div_id;
			},
			
			getItemDescId : function(item)
			{
				var item_id = this.getItemDivId( item.id );
				var desc_div_id = item_id + "_desc";
				return desc_div_id;
			},
			
			// Select item with specified id (raw method)
			selectItem: function( id )
			{
				//console.log( "Selected item "+id );
				var item_div = $( this.getItemDivId( id ) );
				
				if( this.selectionApparance == 'border' )
				{
					dojo.style( item_div, 'borderWidth', this.apparenceBorderWidth );
				}
				else if( this.selectionApparance == 'disappear' )
				{
					dojo.fadeOut( { node: item_div } ).play();
				}
				else if( this.selectionApparance == 'class' )
				{
					dojo.addClass( item_div, this.selectionClass );
				}
				else if( this.selectionApparance == 'striped' )
				{
					var selection_div_id = item_div.id + "_selected";
					dojo.place("<div id=" + selection_div_id + " class='blst_tile_striped slide_left_animated'></div>", item_div);
				}
				
				this.item_selected[ id ] = 1;
			},
			
			// Unselect item with specified id (raw method)
			unselectItem: function( id )
			{
				//console.log( "Unselect item "+id );
				var item_div = $( this.getItemDivId( id ) );
				
				if( this.selectionApparance == 'border' )
				{    dojo.style( item_div, 'borderWidth', '0px' );  }
				else if( this.selectionApparance == 'disappear' )
				{    dojo.fadeIn( { node: item_div } ).play();      }
				else if( this.selectionApparance == 'class' )
				{    dojo.removeClass( item_div, this.selectionClass );     }
				else if( this.selectionApparance == 'striped' )
				{
					var selection_div_id = item_div.id + "_selected";
					var selection_div = dojo.byId(selection_div_id);
					dojo.destroy(selection_div);
				}
				
				this.item_selected[ id ] = 0;            
			},
			
			IsAnyItemSelected : function()
			{
				for (var i in this.item_selected)
				{
					if(this.item_selected[i])
					{
						return true;
					}
					return false;
				}
			},
			
			IsLastItemSelected : function()
			{
				var num_selected = 0;
				for (var i in this.item_selected)
				{
					if(this.item_selected[i])
					{
						num_selected += 1;
					}
				}
				
				return (num_selected == 1);
			},
			
			GetArmyDefensiveBonus : function()
			{
				//console.log("page::GetArmyDefensiveBonus()");
				//console.log(this);
				if(this.stack_type != STACK_ARMY)
				{
					console.log("WARNING! Tile:GetArmyDefensiveBonus() called on wrong stack_type:" + this.stack_type);
					console.log(this);
					return -1;
				}
				
				var total_stack_bonus = 0;
				for(var index in this.items)
				{
					var item = this.items[index];
					//console.log(item);
					var tilebonus_amount = window.gameui.getTileCombatBonus(Number(item.type), this.player_id, false, this.prov_name);
					total_stack_bonus += tilebonus_amount;
				}
				
				return total_stack_bonus;
			},
			
			// Unselect item with specified id (raw method)
			unselectStack: function()
			{
				if(this.selectable == 3)
				{
					if(this.selected_div)
					{
						dojo.style(this.selected_div, 'opacity', '0');
						dojo.style(this.selected_div, 'width', '0px');
						dojo.style(this.selected_div, 'height', '0px');
						
						this.stack_is_selected = false;
					}
				}
				else
				{
					this.inherited(arguments);
				}
			},
			
			unselectAll: function()
			{
				this.inherited(arguments);
				//this.unselectStack();
			},
			
			ItemToTop : function(item_id)
			{
				//console.log("Tilestack::ItemToTop(" + item_id + ")");
				//console.log(this.items);
				//todo: due to the custom render callback for army stack selection, this is not actually reordering the tiles on the client screen
				var item = this.getItemById(item_id);
				
				this.max_weight += 1;
				var new_weights = {};
				new_weights[item.type] = this.max_weight;
				this.changeItemsWeight(new_weights);
				//console.log(this.items);
			},
			
			ItemToBottom : function(item_id)
			{
				//console.log("Tilestack::ItemToBottom(" + item_id + ")");
				//console.log(this.items);
				//todo: due to the custom render callback for army stack selection, this is not actually reordering the tiles on the client screen
				var item = this.getItemById(item_id);
				
				this.max_weight += 1;
				var new_weights = {};
				new_weights[item.type] = -this.max_weight;
				this.changeItemsWeight(new_weights);
				//console.log(this.items);
			},
			
			changeItemsWeight: function( newWeights )
			{
				//console.log( 'changeItemsWeight' );
				//console.log( newWeights );
				for( var type in newWeights )
				{
					var newWeight = newWeights[ type ];
					if( this.item_type[ type ] )
					{
						this.item_type[ type ].weight = newWeight;
					}
					else
					{   console.error( 'unknow item type'+ type );  }
				}
				
				this.sortItems();
				this.updateDisplay();
			},
			
			getItemDivId: function(id, do_debug = false)
			{
				var retval = this.control_name+'_item_'+id;
				if(do_debug)	console.log("Tilestack::getItemDivId(" + id + ") " + retval);
				return retval;
			},
			
		});
		
		return singleton;
	}
);