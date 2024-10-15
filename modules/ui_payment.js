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
		//this.payment_mode = STATE_INVALID;	//use the same constants as action phases
		
		var instance = declare("_ui_payment", null, {
			
			//put your functions here

			EnablePaymentBucket : function(payment_mode)
			{
				//console.log("page::EnablePaymentBucket(" + payment_mode + ")");
				this.payment_mode = payment_mode;
				this.cost_amount = 0;
				this.paid_amount = 0;
				
				//grab the parent container
				const leftpanel = dojo.byId("gamewindow");
				
				//create the basic panel
				var paywindow = dojo.byId("paywindow");
				if(paywindow)
				{
					dojo.destroy(dojo.byId("paywindow"));
				}
				paywindow = dojo.place("<div id=\"paywindow\"></div>", "centrepanel", "after");
				dojo.addClass("paywindow","paywindow_slidein");
				dojo.style(paywindow, 'zIndex', this.GameLayerPaywindow());
				
				//dojo.style(paywindow, 'zIndex', this.GameLayerUIMiddle());
				//dojo.style(paywindow, 'left', "10px");	//move this to help with testing
				//dojo.style(paywindow, 'top', "500px");	//move this to help with testing
				var debug_borders = "none";
				
				//current cost of this action
				var cost_container = dojo.place("<div id=\"action_cost\" class=\"action_pips_container \"></div>",paywindow);
				var cost_title = dojo.place("<div class=\"action_pips_title\">" + this.GetActionCostDescString(payment_mode) + "</div>",cost_container);
				var cost_current = dojo.place("<div id=\"action_cost_current\" class=\"action_pips_amount\">" + this.GetActionCostAmount() + "</div>",cost_container);
				var cost_icon = dojo.place("<div class=\"action_currency_icon " + this.GetCurrencyCostIconCSS(payment_mode) + "\"></div>",cost_container);
				
				//amount player has paid towards the current action
				var paid_container = dojo.place("<div id=\"action_paid\" class=\"action_pips_container \"></div>",paywindow);
				var paid_title = dojo.place("<div class=\"action_pips_title\">" + this.GetActionPaidDescString(payment_mode) + "</div>",paid_container);
				var paid_current = dojo.place("<div id=\"action_paid_current\" class=\"action_pips_amount\">" + this.GetActionPaidAmount() + "</div>",paid_container);
				var paid_icon = dojo.place("<div class=\"action_currency_icon " + this.GetCurrencyPaidIconCSS(payment_mode) + "\"></div>",paid_container);
				
				//extra info string only during undead phase
				var action_undead_unselect = dojo.place("<div id=\"action_undead\" class=\"display_none\">" + this.GetUndeadUnselectedString() + "</div>",paywindow);
				
				//info string
				var pay_info_string = this.GetPayInfoString(payment_mode);
				if(pay_info_string)	//javascript truthiness interprets "" as false
				{
					dojo.place("<div id=\"paywindow_info\">" + pay_info_string + "</div>", paywindow)                                                                                               
				}
				
				this.CreatePaymentNode("paywindow", "paycontainer_default", this.GetTileDropPayString(payment_mode));
				/*
				//setup a tilestack to hold any tiles the player drops here
				//tiles are the "currency" used to pay for movement
				this.current_player_paystack = new modules.TileStack();
				this.current_player_paystack.createAsPaystack(this, "paywindow", this.getActivePlayerId());
				
				//box for player to drop tiles to pay for the current action
				var action_payment_bucket = dojo.place("<div id=\"action_payment_bucket\">" + this.GetTileDropPayString(payment_mode) + "</div>", paywindow);
				action_payment_bucket.ondragenter = this.PayBucketDragEnter;
				action_payment_bucket.ondragleave = this.PayBucketDragLeave;
				action_payment_bucket.ondragover = this.PayBucketDragOver;
				action_payment_bucket.ondrop = this.PayBucketDrop;
				*/
				
				//button to cancel action
				var cancel_button = dojo.place("<div id=\"cancel_button\" class=\"action_cancel blst_button\">" + this.GetActionCancelString(payment_mode) + "</div>", paywindow);
				dojo.connect(cancel_button, "click", dojo.hitch(this, this.CancelAction));
				
				//button to approve action
				var approve_button = dojo.place("<div id=\"approve_button\" class=\"action_approve blst_button\">" + this.GetActionApproveString(payment_mode) + "</div>", paywindow);
				dojo.connect(approve_button, "click", dojo.hitch(this, this.PayAction));
				
				//nonfunctional button to indicate the paywindow can be dragged (note: user can click and drag from anywhere on the paywindow)
				var paywindow_drag = dojo.place("<div id=\"paywindow_drag_button\"></div>",paywindow);
				//dojo.addClass(paywindow_drag, "blst_button");
				
				//button to minimise the paywindow to reveal more screen space over themap
				var paywindow_minimise_button = dojo.place("<div id=\"paywindow_minimise_button\"><</div>",paywindow);
				dojo.addClass(paywindow_minimise_button, "blst_button");
				dojo.connect(paywindow_minimise_button, "click", dojo.hitch(this, this.MinimisePaywindow));
				
				//dragging
				paywindow.draggable = true;
				paywindow.ondragstart = window.gameui.PaywindowDragStart;
				paywindow.ondrag = window.gameui.PaywindowDrag;
				paywindow.ondrop = window.gameui.PaywindowDrop;
				this.paywindowPrevY = 0;
				this.paywindowPrevX = 0;
			},
			
			CreatePaymentNode : function(parent_id, container_id, payment_string, paystack_node_id = "paystack")
			{
				let container_node = dojo.place("<div id=\"" + container_id + "\" class=\"payment_container\"></div>", parent_id);
				
				//setup a tilestack to hold any tiles the player drops here
				//tiles are the "currency" used to pay for things
				this.current_player_paystack = new modules.TileStack();
				
				//there is only one paystack per player, so it doesnt make sense for them to each have a unique id when it could use player_id
				this.current_player_paystack.createAsPaystack(this, container_id, this.getActivePlayerId(), paystack_node_id);
				
				this.CreatePaymentBucket(container_id, payment_string);
			},
			
			CreatePaymentBucket : function(container_id, payment_string)
			{
				//box for player to drop tiles to pay for the current action
				var action_payment_bucket = dojo.place("<div id=\"action_payment_bucket\">" + payment_string + "</div>", container_id);
				switch(this.payment_mode)
				{
					case gameui.STATE_FREEBUILD:
					{
						//cant pay for extra undead movement
						dojo.addClass("action_payment_bucket","action_payment_bucket_striped");
						break;
					}
					case gameui.STATE_UNDEAD:
					{
						//cant pay for extra undead movement
						dojo.addClass("action_payment_bucket","action_payment_bucket_striped");
						break;
					}
					default:
					{
						action_payment_bucket.ondragenter = this.PayBucketDragEnter;
						action_payment_bucket.ondragleave = this.PayBucketDragLeave;
						action_payment_bucket.ondragover = this.PayBucketDragOver;
						action_payment_bucket.ondrop = this.PayBucketDrop;
						break;
					}
				}
			},
			
			LockPaymentBucket : function()
			{
				const action_payment_bucket = dojo.byId("action_payment_bucket");
				action_payment_bucket.ondragenter = null;
				action_payment_bucket.ondragleave = null;
				action_payment_bucket.ondragover = null;
				action_payment_bucket.ondrop = null;
				
				dojo.addClass("paywindow","inactive_phase");
				dojo.addClass("paywindow","transparent");
				dojo.addClass("approve_button","blst_button_disabled");
				dojo.addClass("cancel_button","blst_button_disabled");
				
				this.current_player_paystack.setSelectionMode(0);
			},
			
			PayBucketDragEnter : function(event)
			{
				//console.log("page::PayBucketDragEnter()");
				var item_div_id = window.gameui.dragging_data_id;//event.dataTransfer.getData("text/plain");
				var check_string = null;
				if(item_div_id != null)
				{
					check_string = item_div_id.substring(0,16);
				}
				if(check_string == "player_hand_item")
				{
					dojo.addClass("action_payment_bucket", "action_payment_bucket_dragover");
				}
			},
			
			PayBucketDragLeave : function(event)
			{
				//console.log("page::PayBucketDragLeave()");
				var item_div_id = window.gameui.dragging_data_id;//event.dataTransfer.getData("text/plain");
				var check_string = null;
				if(item_div_id != null)
				{
					check_string = item_div_id.substring(0,16);
				}
				if(check_string == "player_hand_item")
				{
					dojo.removeClass("action_payment_bucket", "action_payment_bucket_dragover");
				}
			},
			
			PayBucketDragOver : function(event)
			{
				event.preventDefault();
			},
			
			PayBucketDrop : function(event)
			{
				//console.log("page::PayBucketDrop()");
				var item_div_id = window.gameui.dragging_data_id;//event.dataTransfer.getData("text/plain");
				var check_string = null;
				if(item_div_id != null)
				{
					check_string = item_div_id.substring(0,16);
				}
				if(check_string == "player_hand_item")
				{
					//console.log("PayBucketDrop");
					dojo.removeClass("action_payment_bucket", "action_payment_bucket_dragover");
					//console.log(event);
					
					//note: the item div id is set by the tilestack like this: 
					//this.control_name+'_item_'+id;
					//where id is the unique integer id of the tile
					//the item div id here is in the format "player_hand_item_XY"
					var item_id = item_div_id.substring(17);
					//console.log("dropped: " + item_div_id + " extracting: " + item_id);
					window.gameui.PayTile(item_id);
				}
			},
			
			PayTile : function(tile_id)
			{
				//TileStack::SpawnTileInStack : function(tile_info, source_div_id = undefined, selected = 1)
				var refund_previous = false;
				switch(this.payment_mode)
				{
					case gameui.STATE_BUILDVILLAGE:
					{
						refund_previous = true;
					}
					case gameui.STATE_CAPTURE:
					{
						refund_previous = true;
					}
					case gameui.STATE_MAIN_CAPTURE:
					{
						refund_previous = true;
					}
				}
				if(refund_previous)
				{
					//first, "bump" off the previous tile if there is one
					while(this.current_player_paystack.items.length > 0)
					{
						var item = this.current_player_paystack.items[0];
						var tile_info = this.current_player_paystack.GetTileInfo(item.id);
						this.RefundPaystackTile(tile_info);
						this.showMessage(_("You may only build up to 1 tile's worth of villages per turn"), "info");
					}
				}
				
				//console.log(this.current_player_hand);
				var tile_info = this.current_player_hand.GetTileInfo(tile_id);
				this.current_player_hand.RemoveTileFromStack(tile_id);
				//console.log(this.current_player_hand.tiles);
				//console.log(tile_info);
				this.current_player_paystack.SpawnTileInStack(tile_info);
				//console.log(this.current_player_paystack);
				
				switch(this.payment_mode)
				{
					case gameui.STATE_CAPTURE:
					{
						this.AddActionPaidAmount(this.GetTilePips(tile_info.type_arg));
						break;
					}
					case gameui.STATE_MAIN_CAPTURE:
					{
						this.AddActionPaidAmount(this.GetTilePips(tile_info.type_arg));
						break;
					}
					case gameui.STATE_MAIN_MOVE:
					{
						this.AddActionPaidAmount(this.GetTilePips(tile_info.type_arg));
						break;
					}
					case gameui.STATE_BUILDVILLAGE:
					{
						this.AddActionPaidAmount(this.GetTilePips(tile_info.type_arg));
						break;
					}
					case gameui.STATE_MAIN_BUILD:
					{
						this.AddActionPaidAmount(1);
						break;
					}
					case gameui.STATE_MAIN_BATTLE:
					{
						//i'm leaving this in for now but im pretty sure it's using a different system
						//see battle_states.js
						//this.trySwapBattleTile(tile_info);
						console.log("ERROR: page::PayTile(" + tile_id + ") during gameui.STATE_MAIN_BATTLE, should be using ServerSwapTile() instead");
						break;
					}
					default:
					{
						console.log("WARNING: page::PayTile(" + tile_id + ") unknown payment mode: " + this.payment_mode);
						break;
					}
				}
			},
			
			CancelAction : function()
			{
				//console.log("page::CancelAction() this.payment_mode:" + this.payment_mode);
				switch(this.payment_mode)
				{
					case gameui.STATE_FREEBUILD:
					{
						this.ExitBuildMode(false);
						this.ServerSkipAction();
						break;
					}
					case gameui.STATE_CAPTURE:
					{
						//all factions except chaos horde capturing villages
						this.EndCaptureState(false);
						break;
					}
					case gameui.STATE_MAIN_CAPTURE:
					{
						//chaos horde capturing villages
						this.ExitCaptureMode(false);
						break;
					}
					case gameui.STATE_MAIN_MOVE:
					{
						this.EndMoveMode(false);
						break;
					}
					case gameui.STATE_MAIN_BUILD:
					{
						this.ExitBuildMode(false);
						break;
					}
					case gameui.STATE_BUILDVILLAGE:
					{
						this.EndVillageState(false);
						break;
					}
					case gameui.STATE_UNDEAD:
					{
						this.ResetUndeadState(true);
						break;
					}
					default:
					{
						console.log("WARNING: page::CancelAction() unknown payment mode: " + this.payment_mode);
						break;
					}
				}
				this.cost_amount = 0;
				this.paid_amount = 0;
			},
			
			RefundPaystackTiles : function()
			{
				//console.log("page::RefundPaystackTiles()");
				while(this.current_player_paystack.items.length > 0)
				{
					var item = this.current_player_paystack.items[0];
					var tile_info = this.current_player_paystack.GetTileInfo(item.id);
					this.RefundPaystackTile(tile_info);
				}
			},
			
			RefundPaystackTile : function(tile_info)
			{
				//console.log("page::RefundPaystackTile()");
				//console.log(tile_info);
				this.current_player_paystack.RemoveTileFromStack(tile_info.id);
				var from_location = "paystack";
				switch(this.payment_mode)
				{
					case gameui.STATE_MAIN_MOVE:
					{
						this.AddActionPaidAmount(-this.GetTilePips(tile_info.type_arg));
						break;
					}
					case gameui.STATE_BUILDVILLAGE:
					{
						this.AddActionPaidAmount(-this.GetTilePips(tile_info.type_arg));
						break;
					}
					case gameui.STATE_MAIN_BUILD:
					{
						this.AddActionPaidAmount(-1);
						break;
					}
					case gameui.STATE_MAIN_BATTLE:
					{
						//nothing else needs to be done here
						from_location = "paybucket_battle";
						//console.log("WARNING: page::RefundPaystackTile() unfinished code case gameui.STATE_MAIN_BATTLE");
						break;
					}
				}
				this.current_player_hand.SpawnTileInStack(tile_info,from_location);
			},
			
			PayAction : function()
			{
				//console.log("page::PayAction()");
				//have we paid enough? basic ui check here, server also does security check
				if(!this.HasActionPaidEnough())
				{
					this.showMessage(this.GetInsufficientPayString(this.payment_mode), 'error');
				}
				else
				{
					switch(this.payment_mode)
					{
						case gameui.STATE_FREEBUILD:
						{
							//todo: send request to server for tile payment
							//for now, just refreshing the page will "refund" these tiles anyway
							//this.RefundPaystackTiles();

							this.ExitBuildMode(true);
							break;
						}
						case gameui.STATE_CAPTURE:
						{
							this.EndCaptureState(true);
							break;
						}
						case gameui.STATE_MAIN_CAPTURE:
						{
							this.ExitCaptureMode(true);
							break;
						}
						case gameui.STATE_MAIN_MOVE:
						{
							//todo: send request to server for tile payment
							//for now, just refreshing the page will "refund" these tiles anyway
							//this.RefundPaystackTiles();

							this.EndMoveMode(true);
							break;
						}
						case gameui.STATE_MAIN_BUILD:
						{
							//todo: send request to server for tile payment
							//for now, just refreshing the page will "refund" these tiles anyway
							//this.RefundPaystackTiles();

							this.ExitBuildMode(true);
							break;
						}
						case gameui.STATE_BUILDVILLAGE:
						{
							this.EndVillageState(true);
							break;
						}
						case gameui.STATE_MAIN_BATTLE:
						{
							//todo
							//actually this is fine, for some reason i handle this ui flow elsewhere
							//i should still probably clean it up for consistency
							console.log("WARNING: page::PayAction() unfinished code case gameui.STATE_MAIN_BATTLE");
							break;
						}
						case gameui.STATE_UNDEAD:
						{
							this.EndUndeadState(true);
							break;
						}
					}
				}
			},
			
			DestroyPayWindow : function()
			{
				var paywindow = dojo.byId("paywindow");
				if(paywindow)
				{
					dojo.removeClass("paywindow","paywindow_slidein");
					dojo.removeClass("paywindow","paywindow_minimise");
					dojo.removeClass("paywindow","paywindow_unminimise");
					dojo.addClass("paywindow","paywindow_slideout");
					//dojo.destroy(dojo.byId("paywindow"));
				}
				this.payment_mode = gameui.STATE_INVALID;
			},
			
			SetActionCost : function(new_value)
			{
				var node = dojo.byId("action_cost_current");
				if(node)
				{
					if(new_value < 0)
					{
						node.innerHTML = "";
					}
					else
					{
						node.innerHTML = new_value;
					}
					this.UpdateActionPayButton();
				}
				else
				{
					//this triggers when we are destroying the pay window, so it's ok
					//console.log("WARNING: page::SetActionCost(" + new_value + ") but could not find node \"action_cost_current\"");
				}
			},
			
			UpdateActionPayButton : function()
			{
				if(this.HasActionPaidEnough())
				{
					dojo.removeClass("approve_button","blst_button_disabled");
				}
				else
				{
					dojo.addClass("approve_button","blst_button_disabled");
				}
			},
			
			SetPaymodeUndeadUnselect : function()
			{
				dojo.removeClass("action_undead", "display_none");
				dojo.addClass("action_cost", "display_none");
				dojo.addClass("action_paid", "display_none");
			},
			
			SetPaymodeUndeadSelect : function()
			{
				dojo.addClass("action_undead", "display_none");
				dojo.removeClass("action_cost", "display_none");
				dojo.removeClass("action_paid", "display_none");
			},
			
			SetActionPaid : function(new_value)
			{
				var node = dojo.byId("action_paid_current");
				if(node)
				{
					if(new_value < 0)
					{
						node.innerHTML = "";
					}
					else
					{
						node.innerHTML = new_value;
					}
					this.UpdateActionPayButton();
				}
			},
			
			AddActionCostAmount : function(new_amount)
			{
				this.cost_amount += new_amount;
				this.SetActionCost(this.cost_amount);
			},
			
			GetActionCostAmount : function()
			{
				return this.cost_amount;
			},
			
			AddActionPaidAmount : function(new_amount)
			{
				this.paid_amount += new_amount;
				this.SetActionPaid(this.paid_amount);
			},
			
			HasActionPaidEnough : function()
			{
				return (this.GetActionPaidAmount() >= this.GetActionCostAmount());
			},
			
			GetActionPaidAmount : function()
			{
				return this.paid_amount;
			},
			
			MinimisePaywindow : function(event)
			{
				//console.log("page::MinimisePaywindow()");
				var paywindow = dojo.byId("paywindow");
				if(paywindow)
				{
					var paywindow_minimise_button = dojo.byId("paywindow_minimise_button");
					
					//snap back to the default position
					paywindow.style.removeProperty('top');
					paywindow.style.removeProperty('left');	
					if(dojo.hasClass(paywindow, "paywindow_minimise"))
					{
						dojo.removeClass(paywindow, "paywindow_minimise");
						dojo.addClass(paywindow, "paywindow_unminimise");
						paywindow_minimise_button.innerText = "<";
					}
					else
					{
						dojo.removeClass(paywindow, "paywindow_unminimise");
						dojo.removeClass(paywindow, "paywindow_slidein");
						dojo.addClass(paywindow, "paywindow_minimise");
						paywindow_minimise_button.innerText = ">";
					}
				}
			},
			
			PaywindowDragStart : function(event)
			{
				//console.log("page::PaywindowDragStart()");
				window.gameui.paywindowPrevY = event.pageY;
				window.gameui.paywindowPrevX = event.pageX;
				
				var paywindow = dojo.byId("paywindow");
				if(dojo.hasClass(paywindow, "paywindow_minimise"))
				{
					var paywindow_minimise_button = dojo.byId("paywindow_minimise_button");
					dojo.removeClass(paywindow, "paywindow_minimise");
					paywindow_minimise_button.innerText = "<";
				}
				else if(dojo.hasClass(paywindow, "paywindow_minimise"))
				{
					var paywindow_minimise_button = dojo.byId("paywindow_minimise_button");
					dojo.removeClass(paywindow, "paywindow_unminimise");
					paywindow_minimise_button.innerText = "<";
				}
			},
			
			PaywindowDrag : function(event)
			{
				//console.log(event);
				
				var newPageY = event.pageY;
				var newPageX = event.pageX;
				
				//console.log("page::PaywindowDrag() newPageX:" + newPageX + ", newPageY:" + newPageY);
				//console.log(event);
				
				//get some useful stuff
				var paywindow = dojo.byId("paywindow");
				var paywindow_marginbox = dojo.marginBox(paywindow);
				var container_marginbox = dojo.marginBox(dojo.byId("gamewindow"));
				
				if(newPageY != 0)
				{
					var deltaY = (window.gameui.paywindowPrevY - newPageY);
					
					var maxY = container_marginbox.h - paywindow_marginbox.h;
					var minY = 0;
					var newDivY = paywindow_marginbox.t - deltaY;
					if(newDivY < maxY && newDivY > minY)
					{
						dojo.style(paywindow,"top", newDivY + "px");
						window.gameui.paywindowPrevY = newPageY;
					}
				}
				if(newPageX != 0)
				{
					var deltaX = (window.gameui.paywindowPrevX - newPageX);
					
					var maxX = container_marginbox.w - paywindow_marginbox.w;
					var minX = 0;
					var newDivX = paywindow_marginbox.l - deltaX;
					if(newDivX < maxX && newDivX > minX)
					{
						//console.log("positioned");
						dojo.style(paywindow,"left", newDivX + "px");
						window.gameui.paywindowPrevX = newPageX;
					}
				}
			},
			PaywindowDrop : function(event)
			{
				event.preventDefault();
			},
		});
		
		return instance;
	}
);