package com.prime5chat.chatter.repositories;

import com.prime5chat.chatter.models.ChatChannel;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChannelRepository extends CrudRepository<ChatChannel, Long> {
}
