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
		
		var instance = declare("_capture_approvecancel", null, {
			
			BeginCaptureState : function()
			{
				console.log("page::BeginCaptureState()");
				this.EnablePaymentBucket(gameui.STATE_CAPTURE);
				this.UICanvasRenderCaptureOverlay();		//run once before the animation kicks in
				this.StartAnimatedCanvas(this.UICanvasRenderCaptureOverlay)
			},
			
			EndCaptureState : function(approved)
			{
				console.log("page::EndCaptureState(" + approved + ")");
				
				this.StopAnimatedCanvas();
				this.ClearCanvas();
				if(approved)
				{
					if(!this.IsAnyVillageCaptureQueued())
					{
						approved = false;
					}
					
					//if the player queued no actions, then this hack should nicely handle cleanup for us
					if(this.GetActionCostAmount() == 0)
					{
						approved = false;
					}
				}
				
				//was this action successful or cancelled?
				if(approved)
				{
					//console.log("move approved");
					//lock in the army stack movement by sending it to the server 
					//note: this includes army splits as well as moves
					this.LockPaymentBucket();
					this.ServerPayAction(this.ACTION_CAPTURE);
				}
				else
				{
					//console.log("move cancelled");
					//reset the planned move
					this.RefundPaystackTiles();
					this.DestroyPayWindow();
					this.CancelAllPlannedVillageCaptures();
					this.ServerSkipAction();
				}
			},
		});
			
		return instance;
	}
);