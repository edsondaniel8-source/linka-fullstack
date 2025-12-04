-- Verificar a assinatura exata da função
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type,
  p.prokind as kind,
  l.lanname as language
FROM pg_proc p
LEFT JOIN pg_language l ON p.prolang = l.oid
WHERE p.proname LIKE '%search_hotels%'
ORDER BY p.proname;
