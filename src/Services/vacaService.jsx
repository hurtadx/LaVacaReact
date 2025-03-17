import { supabase } from '../Supabase/supabaseConfig';


export const inviteParticipants = async (vacaId, userIds, senderId) => {
  try {
    
    if (!vacaId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return { 
        data: null, 
        error: 'Se requiere un ID de vaca y al menos un usuario para invitar' 
      };
    }

    
    const { data: vaca, error: vacaError } = await supabase
      .from('vacas')
      .select('id, name')
      .eq('id', vacaId)
      .single();
    
    if (vacaError) {
      console.error("Error al verificar la vaca:", vacaError);
      return { data: null, error: 'La vaca especificada no existe o no tienes acceso' };
    }
    
    
    const { data: existingParticipants, error: participantsError } = await supabase
      .from('participants')
      .select('user_id')
      .eq('vaca_id', vacaId)
      .in('user_id', userIds);
      
    if (participantsError) {
      console.error("Error al verificar participantes:", participantsError);
      return { data: null, error: 'Error al verificar participantes existentes' };
    }
    
    
    const existingParticipantIds = existingParticipants?.map(p => p.user_id) || [];
    const filteredUserIds = userIds.filter(id => !existingParticipantIds.includes(id));
    
    if (filteredUserIds.length === 0) {
      return { data: null, error: 'Todos los usuarios ya son participantes' };
    }
    
    
    const invitations = filteredUserIds.map(userId => ({
      vaca_id: vacaId,
      user_id: userId,
      sender_id: senderId,
      status: 'pending'
    }));
    
    const { data, error } = await supabase
      .from('invitations')
      .insert(invitations)
      .select();
      
    if (error) {
      console.error("Error al crear invitaciones:", error);
      return { data: null, error: `Error al crear invitaciones: ${error.message}` };
    }
    
    return { 
      data: {
        sent: data.length,
        invitations: data
      }, 
      error: null 
    };
  } catch (error) {
    console.error("Error al invitar participantes:", error);
    return { data: null, error: error.message };
  }
};

export const getInvitations = async (userId) => {
  try {
    if (!userId) {
      return { data: [], error: 'Se requiere un ID de usuario' };
    }
    
    
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error al obtener invitaciones:", error);
      return { data: [], error: error.message };
    }
    
    
    if (!invitations || invitations.length === 0) {
      return { data: [], error: null };
    }
    
    
    const vacaIds = [...new Set(invitations.map(inv => inv.vaca_id))];
    const senderIds = [...new Set(invitations.map(inv => inv.sender_id))];
    
    
    const { data: vacas, error: vacasError } = await supabase
      .from('vacas')
      .select('id, name, description, color')
      .in('id', vacaIds);
      
    if (vacasError) {
      console.error("Error al obtener datos de vacas:", vacasError);
    }
    
    
    const { data: senders, error: sendersError } = await supabase
      .from('profiles')  
      .select('id, username, email, avatar_url')
      .in('id', senderIds);
      
    if (sendersError) {
      console.error("Error al obtener datos de remitentes:", sendersError);
    }
    
    
    const vacasMap = (vacas || []).reduce((map, vaca) => {
      map[vaca.id] = vaca;
      return map;
    }, {});
    
    const sendersMap = (senders || []).reduce((map, sender) => {
      map[sender.id] = sender;
      return map;
    }, {});
    
    
    const formattedData = invitations.map(inv => ({
      id: inv.id,
      status: inv.status,
      createdAt: inv.created_at,
      user_id: inv.user_id,
      vaca_id: inv.vaca_id,
      sender_id: inv.sender_id,
      vaca: vacasMap[inv.vaca_id] || { name: 'Vaca desconocida' },
      sender: sendersMap[inv.sender_id] || { username: 'Usuario desconocido' }
    }));
    
    return { data: formattedData, error: null };
  } catch (err) {
    console.error("Error inesperado al obtener invitaciones:", err);
    return { data: [], error: err.message };
  }
};

/**
 * Responde a una invitación (aceptar o rechazar)
 * @param {string} invitationId - ID de la invitación
 * @param {string} userId - ID del usuario que responde
 * @param {string} response - Respuesta: 'accept' o 'reject'
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const respondToInvitation = async (invitationId, userId, response) => {
  try {
    if (!invitationId || !userId || !['accept', 'reject'].includes(response)) {
      return { 
        success: false, 
        error: 'Parámetros inválidos. La respuesta debe ser "accept" o "reject"' 
      };
    }
    
    
    const { data: invitation, error: fetchError } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('user_id', userId)
      .single();
      
    if (fetchError || !invitation) {
      console.error("Error al obtener la invitación:", fetchError);
      return { success: false, error: 'La invitación no existe o no te pertenece' };
    }
    
    
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ status: response === 'accept' ? 'accepted' : 'rejected' })
      .eq('id', invitationId);
      
    if (updateError) {
      console.error("Error al actualizar la invitación:", updateError);
      return { success: false, error: `Error al procesar la respuesta: ${updateError.message}` };
    }
    
    
    if (response === 'accept') {
      
      const { data: existingParticipant, error: checkError } = await supabase
        .from('participants')
        .select('id')
        .eq('vaca_id', invitation.vaca_id)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error al verificar participante:", checkError);
        return { success: false, error: `Error al verificar participación: ${checkError.message}` };
      }
      
      
      if (!existingParticipant) {
        
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('username, email')
          .eq('id', userId)
          .single();
          
        if (userError) {
          console.error("Error al obtener datos del usuario:", userError);
          return { success: false, error: `Error al obtener datos de usuario: ${userError.message}` };
        }
        
        
        const { error: participantError } = await supabase
          .from('participants')
          .insert({
            vaca_id: invitation.vaca_id,
            user_id: userId,
            name: userData.username || 'Usuario',
            email: userData.email
          });
          
        if (participantError) {
          console.error("Error al añadir participante:", participantError);
          return { success: false, error: `Error al añadir participante: ${participantError.message}` };
        }
      }
    }
    
    return { 
      success: true, 
      error: null,
      data: {
        status: response === 'accept' ? 'accepted' : 'rejected',
        vaca_id: invitation.vaca_id
      }
    };
  } catch (error) {
    console.error("Error al responder invitación:", error);
    return { success: false, error: error.message };
  }
};



export const checkTablesExist = async () => {
  try {
    console.log("Verificando existencia de tablas...");
    const tables = await Promise.all([
      supabase.from('vacas').select('id').limit(1),
      supabase.from('participants').select('id').limit(1),
      supabase.from('transactions').select('id').limit(1)
    ]);
    
    return {
      vacas: !tables[0].error,
      participants: !tables[1].error,
      transactions: !tables[2].error
    };
  } catch (error) {
    console.error("Error verificando tablas:", error);
    return { vacas: false, participants: false, transactions: false };
  }
};

export const createVaca = async (vacaData, userId) => {
  try {
    if (!vacaData.name || !vacaData.goal) {
      return { 
        data: null, 
        error: 'El nombre y la meta son campos obligatorios' 
      };
    }

    const newVaca = {
      name: vacaData.name,
      description: vacaData.description || '',
      goal: parseFloat(vacaData.goal),
      current: 0,
      deadline: vacaData.deadline || null,
      color: vacaData.color || '#3F60E5',
      user_id: userId,
      is_active: true
    };

    const { data: createdVaca, error: vacaError } = await supabase
      .from('vacas')
      .insert(newVaca)
      .select()
      .single();

    if (vacaError) {
      console.error("Error al crear vaca:", vacaError);
      throw vacaError;
    }

    
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, email')
      .eq('id', userId)
      .single();
      
    const creatorParticipant = {
      vaca_id: createdVaca.id,
      name: profile?.username || 'Creador',
      email: profile?.email || null,
      user_id: userId
    };
    
    await supabase
      .from('participants')
      .insert(creatorParticipant);

    
    const participantsToAdd = vacaData.participants || [];
    
    if (participantsToAdd.length > 0) {
      const formattedParticipants = participantsToAdd.map(p => ({
        vaca_id: createdVaca.id,
        name: p.name,
        email: p.email || null,
        user_id: null 
      }));
      
      const { error: participantsError } = await supabase
        .from('participants')
        .insert(formattedParticipants);
        
      if (participantsError) {
        console.error("Error al agregar participantes:", participantsError);
      }
    }

    
    const { data: vacaWithParticipants, error: fetchError } = await supabase
      .from('vacas')
      .select(`
        *,
        participants (*)
      `)
      .eq('id', createdVaca.id)
      .single();
      
    if (fetchError) {
      console.error("Error al obtener la vaca creada:", fetchError);
      return { data: createdVaca, error: null };
    }

    return { data: vacaWithParticipants, error: null };
  } catch (error) {
    console.error("Error al crear vaca:", error);
    return { data: null, error: error.message };
  }
};

export const getUserVacas = async (userId) => {
  console.log("getUserVacas called with userId:", userId);
  
  try {
    
    const { data: ownedVacas, error: ownedError } = await supabase
      .from('vacas')
      .select(`
        *,
        participants (*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    console.log("Owned vacas query result:", { data: ownedVacas, error: ownedError });

    if (ownedError) {
      console.error("Error obteniendo vacas propias:", ownedError);
      throw ownedError;
    }

    
    const { data: participations, error: participationsError } = await supabase
      .from('participants')
      .select('vaca_id')
      .eq('user_id', userId);

    if (participationsError) {
      console.error("Error obteniendo participaciones:", participationsError);
      throw participationsError;
    }

    
    let participatedVacas = [];
    if (participations && participations.length > 0) {
      const participatedIds = participations.map(p => p.vaca_id);
      const ownedIds = ownedVacas?.map(v => v.id) || [];
      
      
      const uniqueIds = participatedIds.filter(id => !ownedIds.includes(id));
      
      if (uniqueIds.length > 0) {
        const { data: otherVacas, error: otherError } = await supabase
          .from('vacas')
          .select(`
            *,
            participants (*)
          `)
          .in('id', uniqueIds)
          .eq('is_active', true);

        if (otherError) {
          console.error("Error obteniendo vacas participadas:", otherError);
          throw otherError;
        }
        
        participatedVacas = otherVacas || [];
      }
    }

    const allVacas = [...(ownedVacas || []), ...participatedVacas];
    
    
    console.log("Final result from getUserVacas:", { data: allVacas, error: null });
    return { data: allVacas, error: null };
  } catch (error) {
    console.error("Error al obtener vacas:", error);
    return { data: [], error: error.message || "Error desconocido" };
  }
};

export const getVacaDetails = async (vacaId) => {
  try {
    const { data, error } = await supabase
      .from('vacas')
      .select(`
        *,
        participants (*),
        transactions (*)
      `)
      .eq('id', vacaId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("Error al obtener detalles de vaca:", error);
    return { data: null, error: error.message };
  }
};

export const addVacaTransaction = async (transactionData) => {
  try {
    const { vacaId, amount, description, userId } = transactionData;
    
    if (!vacaId || !amount || !userId) {
      return {
        data: null,
        error: 'Faltan datos para la transacción'
      };
    }
    
    const newTransaction = {
      vaca_id: vacaId,
      amount: parseFloat(amount),
      description: description || 'Pago',
      date: new Date().toISOString(),
      user_id: userId
    };
    
    
    const { data: participant } = await supabase
      .from('participants')
      .select('id')
      .eq('vaca_id', vacaId)
      .eq('user_id', userId)
      .single();
      
    if (participant) {
      newTransaction.participant_id = participant.id;
    }
    
    
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert(newTransaction)
      .select()
      .single();
      
    if (transactionError) throw transactionError;
    
    
    const { data: vaca } = await supabase
      .from('vacas')
      .select('current')
      .eq('id', vacaId)
      .single();
      
    const newCurrent = (parseFloat(vaca.current) || 0) + parseFloat(amount);
    
    const { error: updateError } = await supabase
      .from('vacas')
      .update({ current: newCurrent })
      .eq('id', vacaId);
      
    if (updateError) throw updateError;
    
    return {
      data: transaction,
      error: null,
      newTotal: newCurrent
    };
  } catch (error) {
    console.error("Error al añadir pago:", error);
    return { data: null, error: error.message };
  }
};
