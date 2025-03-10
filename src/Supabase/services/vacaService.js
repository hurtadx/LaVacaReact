import { supabase } from '../supabaseConfig';



export const checkTablesExist = async () => {
  try {
    console.log("Verificando existencia de tablas...");
    const tables = await Promise.all([
      supabase.from('vacas').select('id').limit(1),
      supabase.from('participants').select('id').limit(1),
      supabase.from('transactions').select('id').limit(1)
    ]);
    
    const result = {
      vacas: !tables[0].error,
      participants: !tables[1].error,
      transactions: !tables[2].error
    };
    
    console.log("Resultado de verificación:", result);
    return result;
  } catch (error) {
    console.error("Error verificando tablas:", error);
    return { vacas: false, participants: false, transactions: false };
  }
};

export const createVaca = async (vacaData, userId) => {
  try {
    console.log("Creando vaca con datos:", vacaData);
    
    
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

    console.log("Vaca creada:", createdVaca);

    
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
  try {
    console.log("Obteniendo vacas para usuario:", userId);

    
    const { data: ownedVacas, error: ownedError } = await supabase
      .from('vacas')
      .select(`
        *,
        participants (*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (ownedError) {
      console.error("Error obteniendo vacas propias:", ownedError);
      throw ownedError;
    }

    console.log("Vacas propias:", ownedVacas);

    
    const { data: participations, error: participationsError } = await supabase
      .from('participants')
      .select('vaca_id')
      .eq('user_id', userId);

    if (participationsError) {
      console.error("Error obteniendo participaciones:", participationsError);
      throw participationsError;
    }

    console.log("Participaciones:", participations);

    
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

    console.log("Vacas participadas:", participatedVacas);

    
    const allVacas = [...(ownedVacas || []), ...participatedVacas];
    
    console.log("Total vacas:", allVacas.length);
    return { data: allVacas, error: null };
  } catch (error) {
    console.error("Error al obtener vacas:", error);
    return { data: [], error: error.message };
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

export default {
  createVaca,
  getUserVacas,
  getVacaDetails,
  addVacaTransaction,
  checkTablesExist
};