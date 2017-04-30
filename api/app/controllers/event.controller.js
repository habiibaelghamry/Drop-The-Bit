
var Events = require('mongoose').model('Events');
var EventOccurrences = require('mongoose').model('EventOccurrences');
var Business = require('mongoose').model('Business');
var Bookings = require('mongoose').model('Booking');
var Facility = require('mongoose').model('Facility');
var User = require('mongoose').model('RegisteredUser');
var async = require("async");
var schedule = require('node-schedule');
var fs = require('fs');
var path = require('path');

exports.getEvent = function (req, res) {
	if (req.params.id != "undefined") {
		Events.findById(req.params.id, function (err, event) {
			if (err) return res.status(500).json("Oops!! Something went wrong.");

			else
				return res.status(200).json(event);
		});
	}
	else {
		return res.status(500).json("Oops!! Something went wrong.");
	}
}


exports.createFacility = function (req, res) {

	if (req.user && req.user instanceof Business) {
		var id = req.user.id;
		if (!req.body.name || !req.body.description || !req.body.capacity || !req.file) {
			res.status(400).json("Incomplete form");
		}
		else {
			var facility = new Facility(
				{
					name: req.body.name,
					description: req.body.description,
					capacity: req.body.capacity,
					business_id: id
				});

			if (typeof req.file != "undefined") {
				facility.image = req.file.filename;
			}


			facility.save(function (err) {
				if (err)
					res.status(500).json("Oops Something went wrong");
				else {

					res.status(200).json(id);
				}
			});
		}
	}
	else
		res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
}

//don't need to edit fields in repeated events because we will always get them from facility
exports.editFacility = function (req, res) {
	if (req.user && req.user instanceof Business) {
		var id = req.user.id;
		var facility_id = req.params.facilityId;

		Business.findById(id, function (err, business) {
			if (err || !business)

				return res.status(500).json("Oops!! Something went wrong");

			Facility.findById(facility_id, function (err, facility) {
				if (err || !facility)
					return res.status(500).json("Oops!! Something went wrong");

				else {
					//checking that edited facility belongs to logged in business
					if (facility.business_id == id) {
						if (req.body.name)
							facility.name = req.body.name;

						if (req.body.description)
							facility.description = req.body.description;

						if (req.file) {
							var image = facility.image;
							if (typeof image != 'undefined' && image != '') {
								fs.stat(path.resolve('public/uploads/' + image), function (err, stat) {
									if (!err) {
										fs.unlink(path.resolve('public/uploads/' + image), function (err) {
											if (err)
												return res.status(400).json('Could not find image');
										});
									}
								});
							}
							facility.image = req.file.filename;
						}
						//update capacity in event and available in event occurrences
						if (req.body.capacity) {
							facility.capacity = req.body.capacity;
							Events.update({ facility_id: facility_id }, { $set: { capacity: Number(req.body.capacity) } }, { multi: true }, function (err, event) {
								if (err)
									return res.status(500).json({ err: "error updating event" });
							});

							EventOccurrences.update({ facility_id: facility_id }, { $set: { available: Number(req.body.capacity) } }, { multi: true }, function (err, eventocc) {
								if (err)
									return res.status(500).json({ err: "error updating eventocc" });
							});

						}
						if (req.body.name) {
							Events.update({ facility_id: facility_id }, { $set: { name: req.body.name } }, { multi: true }, function (err) {
								if (err)
									return res.status(500).json({ err: "error updating event" });
							});
						}
						if (req.body.description) {
							Events.update({ facility_id: facility_id }, { $set: { description: req.body.description } }, { multi: true }, function (err) {
								if (err)
									return res.status(500).json({ err: "error updating event" });
							});
						}

						facility.save(function (err, newFacility) {
							res.status(200).json(newFacility);
						});

					}
					else
						return res.status(401).json({ err: "You are not authorized to perform this action" });

				}

			});
		});
	}
	else
		res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
}


exports.deleteFacility = function (req, res) {
	if (req.user && req.user instanceof Business) {
		var id = req.user.id;
		var facility_id = req.params.facilityId;
		Business.findById(id, function (err, business) {
			if (err || !business)
				return res.status(500).json({ err: "Oops!! Something went wrong" });
			Facility.findById(facility_id, function (err, facility) {
				if (err || !facility)
					return res.status(500).json({ err: "Oops!! Something went wrong" });
				else {
					if (facility.business_id == id) {
						Facility.remove({ _id: facility_id }, function (err) {
							if (err) return res.status(500).json({ err: "error removing facility" });

						});

						Events.remove({ facility_id: facility_id }, function (err) {
							if (err)
								return res.status(500).json({ err: "error removing event" });

						});

						EventOccurrences.remove({ facility_id: facility_id }, function (err) {
							if (err)
								return res.status(500).json({ err: "error removing event occurence" });
							// else res.status(200).json("Done Deleting");
						});
					}
					else
						return res.status(401).json({ err: "You are not authorized to perform this action" });
				}
			});
			Facility.findByIdAndRemove(facility_id, function (err) {
				if (err)
					res.status(500).json("Something went wrong.");
				else
					res.status(200).json("cancelled facility successfully");
			});
		});
	}
	else
		res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
}



/* This function creates an event. An event can have two types Once or Daily specified by "repeated".
The function creates an event and save it in the database. If it is Daily then 30 instances of event occurrences
will be created and saved in the database. Then I initialize a scheduling rule using node scheduler which adds a
single event occurence next month on a daily basis.
If the type is Once only one event occurrence is added.
*/
exports.createEvent = function (req, res) {

	if (req.user && req.user instanceof Business) {
		var id = req.user.id;
		var now = new Date();
		//if event belongs to facility, fields will be passed from facility to event in hidden fields
		if (!req.body.name || !req.body.description || !req.body.date || !req.body.price || !req.body.capacity || !req.body.repeat) {

			res.status(500).json("Please add all information");

		}
		else if (req.body.repeat != "Once" && req.body.repeat != "Daily") {
			res.status(500).json("Repitition type can either be Daily or Once");
		}
		else if (now - (new Date(req.body.date)) >= 0) {
			res.status(500).json("Enter a valid start date");
		}
		else {

			if (req.body.capacity > 0 && req.body.price > 0) {
				let event = new Events({
					name: req.body.name,
					description: req.body.description,
					price: req.body.price,
					capacity: req.body.capacity,
					repeated: req.body.repeat,
					daysOff: req.body.day,
					business_id: id

				});

				//loaction not required (event can take place in many places or in business venue)
				if (req.body.location) {
					event.location = req.body.location;
				}

				//facility not required in case of just once events
				if (req.body.facility_id) {
					event.facility_id = req.body.facility_id;
				}

				if (typeof req.file != "undefined") {
					event.image = req.file.filename;
				}


				event.save(function (err, event) {
					if (err) res.send(err.message);

				});

				if (req.body.repeat == "Daily") {

					var now = new Date();
					if (req.body.date) {
						now = new Date(req.body.date);
					}
					var arr = [];

					for (var i = 0; i < 30;) {
						var tflag = true;

						for (l = 0; req.body.day && l < req.body.day.length; l++) {
							var y = Number(req.body.day[l]);

							if (y == now.getDay()) {
								tflag = false;
							}
						}
						if (tflag) {
							arr[i] = new Date(now);
							i++;
						}
						now.setDate(now.getDate() + 1);
					}



					async.each(arr, function (date, callback) {


						let occurrence = new EventOccurrences({
							day: date,
							time: req.body.timing,
							available: req.body.capacity,
							event: event._id,
							business_id: id
						});

						if (req.body.facility_id) {
							occurrence.facility_id = req.body.facility_id;
						}

						occurrence.save(function (err, occurrence) {
							if (err) res.status(500).json(err.message);

						});
					}, function (error) {
						if (error) res.json(500, { error: error });
					});

					var rule = new schedule.RecurrenceRule();
					rule.dayOfWeek = [new schedule.Range(0, 6)];
					rule.hour = 0;
					rule.minute = 0;


					var j = schedule.scheduleJob(rule, function () {
						var d = new Date();
						var n = d.getMonth();


						d.setMonth((n + 1) % 12);
						var day = d.getDay();

						let occurrence = new EventOccurrences({
							day: d,
							time: req.body.timing,
							available: req.body.capacity,
							event: event._id,
							business_id: id
						});

						if (req.body.facility_id) {
							occurrence.facility_id = req.body.facility_id;
						}

						var flag = true;

						for (i = 0; req.body.day && i < req.body.day.length; i++) {
							var x = Number(req.body.day[i]);

							if (x == day) {
								flag = false;
							}
						}

						if (flag) {
							occurrence.save(function (err, occurrence) {
								if (err) res.status(500).json(err.message);

							});
						}

					});

				}

				else
					if (req.body.repeat == "Once") {


						let occurrence = new EventOccurrences({
							day: req.body.date,
							time: req.body.timing,
							available: req.body.capacity,
							event: event._id,
							business_id: id
						});

						occurrence.save(function (err, occurrence) {
							if (err)
								res.status(500).json(err.message);
							else {
								var notification = { content: req.user.name + " added " + req.body.name, date: Date.now() };

								async.each(req.user.subscribers, function (subscriber, callback) {
									User.findByIdAndUpdate({ _id: subscriber }, { $push: { "notifications": notification } }, function (err, user) {
										if (err)
											return res.status(500).json("error");
										else {
											user.unread_notifications = user.unread_notifications + 1;
											user.save();

										}
									});
								});
							}
						});
					}
				Business.find({ _id: id }, function (err, business) {
					if (err) res.status(500).json(err.message);
					else res.status(200).json(business);
				});
			}
			else res.status(500).json('Incorrect input');
		}
	}
	else {
		res.status(401).json('You are not a logged in business');
	}
}

exports.getOnceEvents = function (req, res) {
	//whoever views business page can see all "once" events, no restrictions
	var business_id = req.params.id;
	Business.findById(business_id, function (err, business) {
		if (err || !business)
			res.status(500).json("Oops!! Something went wrong.");

		else {
			Events.find({ business_id: business.id, repeated: "Once" }, function (err, events) {
				if (err)
					res.status(500).json("Oops!! Something went wrong.");

				else
					res.status(200).json(events);
			});
		}

	});
}

exports.getOnceEventDetails = function (req, res) {
	var event_id = req.params.eventId;
	Events.findOne({ _id: event_id }, function (err, event) {
		if (err || !event) res.status(500).json("error in findng the event");
		else {
			EventOccurrences.findOne({ event: event_id }, function (err, eventocc) {
				if (err || !eventocc)
					res.status(500).json("error in findng the event");
				else {
					res.status(200).json({ business: event.business_id, event: event, eventocc: eventocc });

				}
			});
		}
	});
}

exports.getFacilities = function (req, res) {
	//whoever views business page can see all facilities, no restrictions
	var business_name = req.params.name;

	Business.find({ name: business_name }, function (err, business) {
		if (err || !business)
			res.status(500).json("Oops!! Something went wrong");
		else {
			Facility.find({ business_id: business.id }, function (err, facilities) {
				if (err)
					res.status(500).json("Oops!! Something went wrong");
				else
					res.status(200).json(facilities);
			});
		}

	});

}

exports.getEvents = function (req, res) {

	if (req.params.name) {

		var name = req.params.name;
		Business.findOne({ name: name }, function (err, business) {
			if (err) res.status(500).json(err.message);
			else if (!business) res.status(500).json("Business not found");
			else {
				var id = business._id;
				Events.find({ business_id: id }, function (err, events) {
					if (err) res.status(500).json(err.message);
					else if (!events) res.status(500).json("Oops!! Something went wrong.");
					else {

						EventOccurrences.find({ business_id: id }, function (err, eventocc) {
							if (err) res.status(500).json(err.message);
							else if (!eventocc) res.status(500).json("Oops!! Something went wrong.");

							else {

								EventOccurrences.find({ business_id: id }, function (err, eventocc) {
									if (err) res.status(500).json(err.message);
									else if (!eventocc) res.status(500).json("Something went wrong");
									else {
										res.status(200).json({ events: events, eventocc: eventocc });
									}
								});
							}
						});
					}


				});
			}

		});
	}
}

exports.getDailyEvents = function (req, res) {
	var facilityId = req.params.facilityId;
	Events.find({ facility_id: facilityId }, function (err, events) {
		if (err) res.status(500).json("Oops!! Something went wrong.");
		else if (!events) res.status(500).json("Oops!! Something went wrong.");
		else {
			EventOccurrences.find({ facility_id: facilityId }, function (err, eventocc) {
				if (err) res.status(500).json("Something went wrong");
				else if (!eventocc) res.status(500).json("Oops!! Something went wrong.");
				else {
					Facility.findOne({ _id: facilityId }, function (err, facility) {
						if (err) res.status(500).json("Oops!! Something went wrong.");
						else {
							res.status(200).json({ events: events, eventocc: eventocc, name: facility.name });

						}
					});

				}
			});
		}
	});

}

exports.getOccurrences = function (req, res) {

		EventOccurrences.find({ event: req.params.eventId }, function (err, events) {
			if (err || !events) res.status(500).json("Something went wrong");
			else
				{
					res.status(200).json({eventocc:events});
				}
		});
	}




			exports.getAllTimings = function (req, res) {
				if (req.user) {
					// EventOccurrences.find({facility_id: req.params.facility_id}, function (err, events) {
					EventOccurrences.find({}, function (err, events) {
						if (err || !events) res.status(500).json("Something went wrong");
						else res.status(200).json(events);
					});
				}
				else {
					res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
				}
			}

			exports.getAllFacilities = function (req, res) {
				Facility.find({}, function (err, facilities) {
					if (err)
						res.status(500).json("error in get facilities");

					else
						res.status(200).json(facilities);
				});
			}

			/* A business can edit an event or an event occurrence based on the changed field. */

			exports.editEvent = function (req, res) {

				if (req.user && req.user instanceof Business && typeof req.params.id != "undefined") {
					var id = req.params.id;
					var business_id = req.user.id;
					var check = 1;
					Events.findById(id, function (err, event) {
						if (err) res.status(500).json("Something went wrong");
						else if (!event) res.status(500).json("Something went wrong");
						else {
							if (event.business_id == business_id) {
								if (typeof req.body.name != "undefined" && req.body.name.length > 0) {
									event.name = req.body.name;

								}

								if (typeof req.body.location != "undefined" && req.body.location.length > 0) {
									event.location = req.body.location;
								}
								if (req.body.price) {
									if (req.body.price < 0) {
										return res.status(500).json("Enter a valid price");
									}
									else {

										event.price = req.body.price;
									}

								}

								if (typeof req.body.description != "undefined" && req.body.description.length > 0) {
									event.description = req.body.description;
								}
								if (req.body.day) {
									event.daysOff = req.body.day;
								}
								if (req.body.date && req.body.date.length > 0) {
									if (event.repeated == "Once") {
										var now = new Date();
										if (now - (new Date(req.body.date)) >= 0) {
											return res.status(500).json("Enter a valid date");
										}

										else {
											EventOccurrences.update({ event: id }, { $set: { day: req.body.date } }, { "multi": true }, function (err, occurrence) {
												if (err) res.status(500).json("Something went wrong");
												else if (!occurrence) res.status(500).json("Something went wrong");

											});
										}
									}
								}
								if (typeof req.body.timing != "undefined" && req.body.timing.length > 0) {
									EventOccurrences.update({ event: id }, { $set: { time: req.body.timing } }, { "multi": true }, function (err) {
										if (err) res.status(500).json("Something went wrong");
									});

								}

								if (check) {
									event.save(function (err, newevent) {
										if (err) return res.status(500).json("Something went wrong");
										else {
											EventOccurrences.find({ event: id }, function (err, occs) {
												if (err) res.status(500).json("Something went wrong");
												else if (!occs) res.status(500).json("Something went wrong");
												else return res.status(200).json({ event: newevent, eventocc: occs });
											})

										}
									});
								}
							}
							else return res.status(500).json("Can not edit this event");
						}

					});
				}
				else {
					return res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
				}

			}

			exports.deleteImage = function (req, res) {
				if (req.user && req.user instanceof Business && typeof req.params.eventId != "undefined" && typeof req.params.image != "undefined") {
					var eventId = req.params.eventId;
					var image = req.params.image;

					Events.findById(eventId, function (err, event) {
						if (err || !event) res.status(500).json("something went wrong");
						else {
							if (event.business_id == req.user.id) {

								Events.findByIdAndUpdate(eventId, { $pull: { image: image } }, { safe: true, upsert: true, new: true }, function (err, updatedEvent) {
									if (err) res.status(500).json("something went wrong");
									else {
										if (typeof image != 'undefined' && image != '') {
											fs.stat(path.resolve('public/uploads/' + image), function (err, stat) {
												if (!err) {
													fs.unlink(path.resolve('public/uploads/' + image), function (err) {
														if (err)
															return res.status(400).json('Could not find image');
													});
												}
											});
										}
									}
									res.status(200).json({ event: updatedEvent });
								});
							} else {
								res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
							}
						}
					});
				} else {
					res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
				}
			}


			exports.addImage = function (req, res) {
				if (req.user && req.user instanceof Business && typeof req.params.eventId != "undefined") {
					var eventId = req.params.eventId;

					Events.findById(eventId, function (err, event) {
						if (err || !event) { res.status(500).json("something went wrong"); }
						else {
							if (event.business_id == req.user.id) {

								Events.findByIdAndUpdate(eventId, { $push: { image: req.file.filename } }, { safe: true, upsert: true, new: true }, function (err, updatedEvent) {
									if (err) res.status(500).json("something went wrong");
									res.status(200).json({ event: updatedEvent });
								});
							} else {
								res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
							}
						}
					});
				} else {
					res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
				}
			}


			/*A business can cancel an event with all its occurrences.*/

			exports.cancelEvent = function (req, res, notify_on_cancel) {
				if (req.user && req.user instanceof Business && typeof req.params.id != "undefined") {
					var id = req.params.id;
					var business_id = req.user.id;
					Events.findById(id, function (err, event) {
						if (!event) res.status(500).json("Something went wrong");
						else
							if (event.business_id == business_id) {
								Events.remove({ _id: id }, function (err) {
									if (err) res.status(500).json("Something went wrong");
									else {
										EventOccurrences.find({ event: id }, function (err, all_occ) {
											if (err) res.status(500).json("Something went wrong");
											else {
												res.status(200).json("deleted");
												async.each(all_occ, function (one_occ, callback) {
													one_occ.remove(function (err) {
														if (err)
															return res.status(500).json("Something went wrong");
													});

												});
											}
										});
									}
								});
							}
							else {
								res.status(500).json("CANNOT CANCEL THIS EVENT");
							}
					});
				}
				else {
					res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
				}

			}


			/** Removes all occurence of an event */
			exports.removeAllOccurrences = function (event_id) {
				EventOccurrences.remove({ event: event_id }, function (err) {
					if (err)
						res.status(500).json("Something went wrong");
					res.status(200).json("Done removing");
				});
			}

			/* Abusiness can cancel an event occurrence.*/

			exports.cancelOccurrence = function (req, res) {

				if (req.user && req.user instanceof Business && typeof req.params.occId != "undefined") {
					var occurrence_id = req.params.occId;
					var business_id = req.user.id;
					EventOccurrences.findById(occurrence_id, function (err, occ) {
						if (!occ) res.status(500).json("Something went wrong");

						Events.findById(occ.event, function (err, event) {
							if (!event) res.status(500).json("Something went wrong");
							else
								if (event.business_id == business_id) {

									EventOccurrences.remove({ _id: occurrence_id }, function (err) {
										if (err) res.status(500).json("Something went wrong");

									});

									res.status(200).json("occurrence cancelled");
								}
								else {
									res.status(500).json("Can not cancel this occurrence");
								}
						});
					});
				}
				else {
					res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
				}

			}

			exports.getOccurrence = function (req, res) {

				if (req.user && req.user instanceof Business) {
					EventOccurrences.findById(req.body.occ_id, function (err, occ) {
						if (err) return res.status(500).json("Oops!! Something went wrong.");
						if (occ.business_id != req.user.id) return res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");

						return res.status(200).json(occ);
					});
				}
				else
					return res.status(401).json("YOU ARE NOT AUTHORIZED TO ACCESS THIS PAGE");
			}
