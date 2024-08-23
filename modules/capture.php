
<?php

trait capture
{
	public function tryPlayerCaptureVillages($action_info, $paid_tile_ids)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::tryPlayerCaptureVillages()"));
		//todo: with $bThrowException set to false i have to manually handle the failures
		self::checkAction("action_captureVillage", false);
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($action_info, true)));
		$success = false;
		$active_player_id = $this->getActivePlayerId();
		$active_faction_id = $this->GetPlayerFaction($active_player_id);
		$village_tile_ids = $action_info;
		$num_planned_captures = count($village_tile_ids);
		
		$retval = ["failure_reason" => self::ACTION_FAIL_UNKNOWN, "amount_paid" => 0];
		
		if($num_planned_captures == 0)
		{
			$retval["failure_reason"] = self::ACTION_SKIP;
			return $retval;
		}
		
		//check the player tiles payment
		$payment_check_info = $this->checkTilePaymentIds($paid_tile_ids, true);
		if($payment_check_info["amount_paid"] == 0)
		{
			//this is a shortcut which is slightly redundant but will save some processing below
			$retval["failure_reason"] = self::ACTION_FAIL_COST;
			return $retval;
		}
		
		//legality check: are the designated provinces valid for capture?
		//wip (seemns to be working?)
		$pending_capture_infos = $this->GetPendingCaptureArmies($active_player_id);
		foreach($village_tile_ids as $village_id)
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking village_id: $village_id"));
			//array(
			   //'id' => ..,          // the card ID
			   //'type' => ..,        // the card type
			   //'type_arg' => ..,    // the card type argument
			   //'location' => ..,    // the card location
			   //'location_arg' => .. // the card location argument
			//);
			//village conventions:
			//$location (varchar16): "hand", $location_arg (int): factionid [0,6]
			//$location (varchar16): "captured", $location_arg (int): factionid [0,6]
			//$location (varchar16): "province", $location_arg (int): prov id [0,999999999+]
			//$type_arg (int): factionid [0,6]
			
			//check if this province is valid
			$village_info = $this->villages_deck->getCard($village_id);
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($village_info, true)));
			//int($village_info['location_arg'])
			
			//loop over each pending capture province to see if this one is valid
			foreach($pending_capture_infos as $capture_info)
			{
				$pending_prov_id = $capture_info['province_id'];
				$actual_location_arg = $village_info['location_arg'];
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking pending capture_info: $pending_prov_id | $actual_location_arg"));
				if($village_info['location_arg'] == (int)$capture_info['province_id'])
				{
					//this village id is capturable
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "success! this village is capturable"));
					$success = true;
					break;
				}
				else
				{
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "not this one..."));
				}
			}
			if(!$success)
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "capture is not legal"));
				$retval["failure_reason"] = self::ACTION_FAIL_FRIENDLIES;
				return $retval;
			}
		}
		if($success)
		{
			$this->incStat($num_planned_captures, "villages_captured", $active_player_id);
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "capture is legal"));
		}
		
		//for testing return early here
		//return $retval;
		
		//assume at this point that everything can proceed smoothly
	
		//move the villages to the 'captured' location for this player
		$this->villages_deck->moveCards($village_tile_ids, "captured", $active_faction_id);
		
		//tell the players
		//todo: this isnt handled in js yet
		$active_player_name = $this->getActivePlayerName();
		self::notifyAllPlayers('playerCaptureSuccess', clienttranslate('${active_player_name} has captured ${num_planned_captures} village(s)'), array(
			'active_player_name' => $active_player_name,
			'num_planned_captures' => $num_planned_captures,
			'capture_player_id' => $active_player_id,
			'captured_village_ids' => $village_tile_ids
		));
		
		//next, process the tile payment
		//grab the appropriate tile deck
		$player_deck = $this->player_decks[$active_player_id];
		
		//move them to discard
		$player_deck->moveCards($paid_tile_ids, "discard");
		
		//update the players
		self::notifyPlayer($active_player_id, 'tileDiscard', '', array(
			'discarded_tiles_ids' => $paid_tile_ids,
			'location_from' => "paystack"
		));
		
		$this->updatePlayerHandChanged($active_player_id);
		
		//now, finish the player's turn because only one capture action is allowed at a time
		$this->activePlayerCompleteState();
		
		//the outer function will handle any exceptions by rolling back player actions if something went wrong
		return $retval;
	}
	
	function debugCreateCapturableVillages()
	{
		//create villages for all except chaos horde
		//note: this assumes 4 players in testing games
		self::notifyAllPlayers("debug", "", array('debugmessage' => "server::debugCreateCapturableVillages()"));
		for($factionid=0; $factionid<4; $factionid++)
		{
			$available_village_infos = $this->villages_deck->getCardsInLocation("hand", $factionid);
			foreach($available_village_infos as $village_id => $avail_village_info)
			{
				//grab the first one
				$next_available_village_info = $avail_village_info;
				$village_id = $next_available_village_info["id"];
				//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($next_available_village_info,true)));
				
				//move the village from hand to province
				$province_id = $factionid + 1;
				$province_name = $this->getProvinceName($province_id);
				//self::notifyAllPlayers("debug", "", array('debugmessage' => $province_id));
				$this->villages_deck->moveCard($village_id, "province", $province_id);
				
				//only need one village
				break;
			}
		}
		
		//create enemy armies on those same provinces
		for($factionid=0; $factionid<4; $factionid++)
		{
			$province_id = $factionid + 2;
			if($province_id >=5)
			{
				$province_id -= 5;
			}
			$province_name = $this->getProvinceName($province_id);
			$player_id = $this->GetFactionPlayer($factionid);
			$player_deck = $this->faction_decks[$factionid];
			self::notifyAllPlayers("debug", "", array('debugmessage' => "$province_name | $player_id | $factionid"));
			//$player_deck->pickCardsForLocation($new_cards, 'bag', 'hand');
			//$tile_ids = [$player_deck->getCardOnTop("bag")];
			$new_army = self::createArmy($province_name, $player_id, [], true);
		}
		
		self::notifyAllPlayers("debug", "", array('debugmessage' => "Created debug capturable villages"));
	}
}